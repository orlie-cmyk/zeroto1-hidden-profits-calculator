import { Download, Loader2 } from 'lucide-react'
import { formatCompact } from '../mathEngine.js'
import { useState, useEffect } from 'react'
import {
  FONT, INDIGO, TEXT_HEADING, TEXT_BODY, BORDER_SUBTLE,
} from '../tokens.js'

// TODO: Replace with real Calendly/HubSpot booking URL
const CALENDLY_BASE = 'https://calendly.com/zeroto1'


/**
 * Alpha-composite an rgba(r,g,b,a) color over WHITE to produce a solid rgb.
 * Prevents semi-transparent backgrounds from bleeding in html2canvas.
 */
function solidifyRgba(rgba) {
  const m = rgba.match(/rgba\(\s*(\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\s*\)/)
  if (!m) return rgba
  const [, r, g, b, a] = m.map(Number)
  return `rgb(${Math.round(255 * (1 - a) + r * a)}, ${Math.round(255 * (1 - a) + g * a)}, ${Math.round(255 * (1 - a) + b * a)})`
}

/**
 * Crop a horizontal strip from a source canvas.
 * Returns a new canvas containing only the pixels from yStart to yEnd.
 */
function cropCanvas(source, yStart, yEnd) {
  const h = Math.max(1, yEnd - yStart)
  const crop = document.createElement('canvas')
  crop.width = source.width
  crop.height = h
  crop.getContext('2d').drawImage(source, 0, yStart, source.width, h, 0, 0, source.width, h)
  return crop
}

/**
 * Generate a branded PDF using section-by-section canvas cropping.
 *
 * Pipeline:
 *  1. Measure section boundaries in the live DOM
 *  2. html2canvas captures #zt1-results-panel as one canvas
 *  3. Crop individual blocks from the canvas (one per logical section)
 *  4. Place each block image on PDF pages — sections are NEVER split
 *  5. Draw header/footer with jsPDF text (crisp, not canvas)
 */
async function generatePDF() {
  const resultsEl = document.getElementById('zt1-results-panel')
  if (!resultsEl) {
    console.warn('[Refunnel] #zt1-results-panel not found — cannot generate PDF')
    return
  }

  try {
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ])

    await document.fonts.ready
    await new Promise((r) => setTimeout(r, 150))

    // ── Step 1: Measure section boundaries in the live DOM ──────
    const panelRect = resultsEl.getBoundingClientRect()
    const sectionNames = [
      'halo-breakdown',
      'meta-comparison',
      'content-engine',
      'annual-projection',
    ]
    const sectionTops = {}
    for (const name of sectionNames) {
      const el = resultsEl.querySelector(`[data-section="${name}"]`)
      if (el) sectionTops[name] = el.getBoundingClientRect().top - panelRect.top
    }

    // ── Step 2: Capture the full panel as one canvas ────────────
    const scale = 2
    const canvas = await html2canvas(resultsEl, {
      scale,
      backgroundColor: '#F9FAFB',
      useCORS: true,
      allowTaint: true,
      logging: false,
      onclone: (_clonedDoc, clonedEl) => {
        const el = clonedEl
        if (!el) return

        const body = _clonedDoc.body
        if (body) {
          body.style.background = '#F9FAFB'
          body.style.backgroundColor = '#F9FAFB'
        }

        // Fix container — keep padding unchanged so positions match live DOM
        el.style.background = '#FFFFFF'
        el.style.backgroundColor = '#FFFFFF'
        el.style.borderRadius = '0'
        el.style.boxShadow = 'none'

        // Remove CTA section
        const cta = el.querySelector('[data-cta-section]')
        if (cta) cta.remove()

        // Force all children visible + solidify rgba backgrounds
        el.style.opacity = '1'
        el.style.animation = 'none'
        el.style.transition = 'none'
        el.style.transform = 'none'

        el.querySelectorAll('*').forEach((child) => {
          child.style.opacity = '1'
          child.style.animation = 'none'
          child.style.transition = 'none'
          child.style.transform = 'none'
          child.classList.remove('rv-animate-section', 'rv-animate-card')
          const bgShort = child.style.background
          if (bgShort && bgShort.includes('rgba'))
            child.style.background = solidifyRgba(bgShort)
          const bgColor = child.style.backgroundColor
          if (bgColor && bgColor.includes('rgba'))
            child.style.backgroundColor = solidifyRgba(bgColor)
        })

        // Delete @media print rules in the clone
        try {
          Array.from(_clonedDoc.styleSheets).forEach((sheet) => {
            try {
              const rules = Array.from(sheet.cssRules || [])
              for (let i = rules.length - 1; i >= 0; i--) {
                if (
                  rules[i] instanceof CSSMediaRule &&
                  rules[i].conditionText === 'print'
                )
                  sheet.deleteRule(i)
              }
            } catch (_) { }
          })
        } catch (_) { }
      },
    })

    // ── Step 3: Define crop blocks using section boundaries ─────
    const cutPoints = sectionNames
      .map((name) => Math.round((sectionTops[name] ?? 0) * scale))
      .filter((v) => v > 0)

    const blockBounds = []
    let prevY = 0
    for (const cutY of cutPoints) {
      if (cutY > prevY) blockBounds.push([prevY, cutY])
      prevY = cutY
    }
    if (prevY < canvas.height) blockBounds.push([prevY, canvas.height])

    // Crop each block from the big canvas
    const blockCanvases = blockBounds.map(([y0, y1]) => cropCanvas(canvas, y0, y1))

    // ── Step 4: Build the PDF, placing each block as its own image ─
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
    const margin = 10
    const pageW = pdf.internal.pageSize.getWidth()   // 210
    const pageH = pdf.internal.pageSize.getHeight()  // 297
    const contentW = pageW - margin * 2              // 190
    const HEADER_H = 18  // space reserved for branded header on page 1
    const FOOTER_H = 12  // space reserved for page footer

    let currentY = margin + HEADER_H  // page 1 starts after header
    let pageNum = 1
    const pageStarts = [0] // which block index starts each page

    // Draw branded header on page 1
    pdf.setFontSize(12)
    pdf.setTextColor(79, 70, 229)
    pdf.text('ZEROTO1 \u00D7 REFUNNEL', pageW / 2, margin + 6, { align: 'center' })
    pdf.setFontSize(9)
    pdf.setTextColor(71, 85, 105)
    pdf.text('HIDDEN PROFITS CALCULATOR \u2014 YOUR RESULTS', pageW / 2, margin + 11, { align: 'center' })
    pdf.setDrawColor(79, 70, 229)
    pdf.setLineWidth(0.5)
    pdf.line(margin, margin + 14, pageW - margin, margin + 14)

    for (let i = 0; i < blockCanvases.length; i++) {
      const blockCanvas = blockCanvases[i]
      const blockH = (blockCanvas.height / blockCanvas.width) * contentW

      // If block doesn't fit on current page, start a new page
      if (currentY + blockH > pageH - margin - FOOTER_H && currentY > margin + HEADER_H) {
        pdf.addPage()
        pageNum++
        pageStarts.push(i)
        currentY = margin
      }

      const imgData = blockCanvas.toDataURL('image/jpeg', 0.95)
      pdf.addImage(imgData, 'JPEG', margin, currentY, contentW, blockH)
      currentY += blockH
    }

    // ── Step 5: Draw footers on every page ──────────────────────
    const totalPages = pageNum
    for (let p = 1; p <= totalPages; p++) {
      pdf.setPage(p)
      pdf.setFontSize(8)
      pdf.setTextColor(100, 100, 100)
      pdf.text(
        `ZEROTO1 \u00D7 REFUNNEL  |  Page ${p} of ${totalPages}`,
        pageW / 2,
        pageH - 5,
        { align: 'center' }
      )
    }

    // ── Step 6: Add booking CTA to last page ────────────────────
    pdf.setPage(totalPages)
    const footerY = pageH - margin - 10
    pdf.setFontSize(10)
    pdf.setTextColor(71, 85, 105)
    pdf.text('Ready to unlock this revenue?', pageW / 2, footerY, { align: 'center' })

    pdf.setFontSize(11)
    pdf.setTextColor(79, 70, 229)
    pdf.textWithLink('Book Your Free Strategy Call \u2192', pageW / 2, footerY + 6, {
      url: CALENDLY_BASE,
      align: 'center',
    })

    pdf.save('Refunnel-Hidden-Profits-Results.pdf')
  } catch (err) {
    console.error('[Refunnel] PDF generation failed:', err)
  }
}

/**
 * CTASection — Refunnel-branded conversion section.
 */
export default function CTASection({ results }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const annualOpp = results?.combined?.totalAnnualOpportunity || 0

  useEffect(() => {
    if (document.querySelector('script[src*="typeform.com/next/embed.js"]')) return
    const s = document.createElement('script')
    s.src = '//embed.typeform.com/next/embed.js'
    s.async = true
    document.body.appendChild(s)
  }, [])

  const handleDownloadClick = async () => {
    if (isGenerating) return;
    setIsGenerating(true)
    try {
      await generatePDF()
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <section
      data-cta-section
      style={{
        position: 'relative',
        padding: '2.5rem 1.5rem 2rem',
        textAlign: 'center',
        fontFamily: FONT,
        borderTop: `1px solid ${BORDER_SUBTLE}`,
        marginTop: 28,
      }}
    >
      <div style={{ maxWidth: '36rem', margin: '0 auto' }}>

        {/* ── Trust line ───────────────────────────────────────── */}
        <p
          style={{
            color: TEXT_BODY,
            fontSize: 14,
            lineHeight: 1.7,
            marginBottom: '1.5rem',
            maxWidth: '30rem',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <strong style={{ color: TEXT_HEADING }}>ZeroTo1</strong> is a TikTok Platinum Partner.
          We're a social commerce agency for brands doing $20M+ annually.
        </p>

        {/* ── Primary CTA — Typeform ────────────────────────────── */}
        <div
          data-tf-live="01KJ8X874HZR7XG59379BDTWWJ"
          style={{ width: '100%', marginBottom: '1rem' }}
        />

        {/* ── Personalized opportunity ─────────────────────────── */}
        <p
          style={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 16,
            color: INDIGO,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginTop: '0.75rem',
            marginBottom: '1.5rem',
          }}
        >
          Your total opportunity: {formatCompact(annualOpp)}/year
        </p>

        {/* ── Secondary CTA (PDF download) ─────────────────────── */}
        <button
          onClick={handleDownloadClick}
          disabled={isGenerating}
          className="btn-ghost"
          style={{
            maxWidth: '24rem',
            width: '100%',
            opacity: isGenerating ? 0.7 : 1,
            cursor: isGenerating ? 'not-allowed' : 'pointer'
          }}
        >
          {isGenerating ? <Loader2 size={16} className="lucide-spin" /> : <Download size={16} />}
          {isGenerating ? 'GENERATING PDF...' : 'DOWNLOAD RESULTS AS PDF'}
        </button>
      </div>

      {/* ── Mobile responsive overrides ────────────────────────── */}
      <style>{`
        @keyframes lucide-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .lucide-spin {
          animation: lucide-spin 1s linear infinite;
        }

        @media (max-width: 600px) {
          [data-cta-section] .btn-cta {
            width: 100% !important;
            max-width: 100% !important;
            padding-left: 1rem !important;
            padding-right: 1rem !important;
            font-size: 14px !important;
          }
          [data-cta-section] .btn-ghost {
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </section>
  )
}
