import { useState, useEffect, useMemo } from 'react'
import { BENCHMARKS } from '../benchmarks.js'
import { calculateAll } from '../mathEngine.js'
import {
  FONT, INDIGO, BG_BASE, BG_GLASS, TEXT_HEADING, TEXT_BODY, BORDER_SUBTLE,
} from '../tokens.js'
import InputPanel from './InputPanel.jsx'
import ResultsVisualizer from './ResultsVisualizer.jsx'
import CTASection from './CTASection.jsx'

/* ══════════════════════════════════════════════════════════════════ */
/*  RESPONSIVE STYLES                                                */
/* ══════════════════════════════════════════════════════════════════ */
const RESPONSIVE_STYLES = `
  /* ── MOBILE (< 768px) ──────────────────────────────────────── */
  @media (max-width: 768px) {
    .zt1-calculator-section {
      padding: 0 16px 48px !important;
    }
    .zt1-calc-header {
      padding-top: 32px !important;
      margin-bottom: 24px !important;
    }
    .zt1-input-card {
      padding: 20px 16px !important;
      border-radius: 24px !important;
    }
    .zt1-results-card {
      padding: 20px 16px !important;
      border-radius: 24px !important;
    }
  }

  /* ── SMALL MOBILE (< 480px) ────────────────────────────────── */
  @media (max-width: 480px) {
    .zt1-branding-header {
      padding: 20px 16px !important;
    }
  }
`

/* ── Branding Header ───────────────────────────────────────────── */
function BrandingHeader() {
  return (
    <div
      className="zt1-branding-header"
      style={{
        background: BG_BASE,
        padding: '28px 24px',
        textAlign: 'center',
        borderBottom: `1px solid ${BORDER_SUBTLE}`,
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 219 35"
        aria-label="ZeroTo1"
        style={{ height: 28, display: 'inline-block' }}
      >
        <path d="M29.5798 25.3699V33.7262H0V25.7136L16.5977 8.85054H0.190292V0.494202H29.0301V8.50684L12.5381 25.3699H29.5798Z" fill="#FFEB03"/>
        <path d="M60.6399 25.1121V33.7262H32.8996V0.494202H60.0479V9.10832H44.444V13.2328H57.0244V21.181H44.444V25.1121H60.6399Z" fill="#FFEB03"/>
        <path d="M78.6749 22.7062H75.5034V33.7262H64.2127V0.494202H81.9522C90.6633 0.494202 95.188 4.21052 95.188 11.6217C95.188 16.498 93.2005 19.7847 89.289 21.4388L97.0275 33.7262H84.4894L78.6961 22.7062H78.6749ZM75.5034 14.9943H79.6264C82.5442 14.9943 83.6437 14.178 83.6437 11.9224C83.6437 9.66684 82.5442 8.85054 79.6264 8.85054H75.5034V14.9943Z" fill="#FFEB03"/>
        <path d="M130.477 17.1208C130.477 27.9905 124.282 34.2417 113.879 34.2417C103.477 34.2417 97.2392 27.9905 97.2392 17.1208C97.2392 6.25114 103.54 0 113.879 0C124.218 0 130.477 6.25114 130.477 17.1208ZM109.037 17.1208C109.037 22.9209 110.517 25.4342 113.9 25.4342C117.283 25.4342 118.7 22.9209 118.7 17.1208C118.7 11.3208 117.262 8.80745 113.9 8.80745C110.539 8.80745 109.037 11.3208 109.037 17.1208Z" fill="#FFEB03"/>
        <path d="M163.82 9.10832H153.608V33.7262H142.063V9.10832H131.809V0.494202H163.82V9.10832Z" fill="#FFEB03"/>
        <path d="M198.347 17.1208C198.347 27.9905 192.152 34.2417 181.75 34.2417C171.347 34.2417 165.11 27.9905 165.11 17.1208C165.11 6.25114 171.41 0 181.75 0C192.089 0 198.347 6.25114 198.347 17.1208ZM176.908 17.1208C176.908 22.9209 178.388 25.4342 181.771 25.4342C185.154 25.4342 186.57 22.9209 186.57 17.1208C186.57 11.3208 185.133 8.80745 181.771 8.80745C178.409 8.80745 176.908 11.3208 176.908 17.1208Z" fill="#FFEB03"/>
        <path d="M218.962 0.494202V33.7262H207.904V11.4713C205.769 13.3832 203.295 14.8439 200.61 15.2521L199.976 5.84312C204.035 5.392 208.496 2.87866 209.976 0.515683H218.941L218.962 0.494202Z" fill="#FFEB03"/>
      </svg>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                                  */
/* ══════════════════════════════════════════════════════════════════ */

export default function CalculatorWidget() {
  // Inject Meta Pixel when widget is embedded on a host page that doesn't have it
  useEffect(() => {
    if (typeof window.fbq === 'function') return
    const pixelId = '291014903534165'
    /* eslint-disable */
    ;(function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)})(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js')
    /* eslint-enable */
    window.fbq('init', pixelId)
    window.fbq('track', 'PageView')
  }, [])

  const defaultInputs = {
    tiktokGMV: BENCHMARKS.defaults.tiktokGMV,
    tiktokAdSpend: BENCHMARKS.defaults.tiktokAdSpend,
    tiktokROI: BENCHMARKS.defaults.tiktokROI,
    avgSampleCost: BENCHMARKS.defaults.avgSampleCost,
    affiliateShare: BENCHMARKS.defaults.affiliateShare,
    metaAdSpend: BENCHMARKS.defaults.metaAdSpend,
    metaROAS: BENCHMARKS.defaults.metaROAS,
    metaCPM: BENCHMARKS.defaults.metaCPM,
    metaCTR: BENCHMARKS.defaults.metaCTR,
    metaCAC: BENCHMARKS.defaults.metaCAC,
    costPerCreative: BENCHMARKS.defaults.costPerCreative,
  }

  const [inputs, setInputs] = useState(defaultInputs)
  const [hasCalculated, setHasCalculated] = useState(false)

  // Auto-calculate on mount with defaults — no empty state
  const [results, setResults] = useState(() => calculateAll(defaultInputs))

  // Read UTM params from URL for attribution tracking
  const utmParams = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    const utm = {}
    const keys = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_content',
      'utm_term',
      'ref_id',
      'email',
    ]
    keys.forEach((key) => {
      const val = params.get(key)
      if (val) utm[key] = val
    })
    return utm
  }, [])

  const handleCalculate = () => {
    const newResults = calculateAll(inputs)
    setResults(newResults)
    setHasCalculated(true)
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 50)
  }

  const handleBack = () => {
    setHasCalculated(false)
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 50)
  }

  // Recalculate on any input change
  useEffect(() => {
    setResults(calculateAll(inputs))
  }, [inputs])

  const handleInputChange = (field, value) => {
    setInputs((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div style={{ fontFamily: FONT, background: BG_BASE }}>
      <style>{RESPONSIVE_STYLES}</style>

      <BrandingHeader />

      <section
        id="zt1-calculator-section"
        className="zt1-calculator-section"
        style={{
          background: BG_BASE,
          padding: '0 24px 80px',
        }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto' }}>

          {/* ── Step 1: Input Panel ─────────────────────────── */}
          {!hasCalculated && (
            <>
              <div
                className="zt1-calc-header"
                style={{ textAlign: 'center', paddingTop: 48, marginBottom: 36 }}
              >
                <p className="micro-label" style={{ marginBottom: 12 }}>
                  HIDDEN PROFITS CALCULATOR{' '}
                  <span style={{ color: INDIGO }}>{'\u25CF'}</span>{' '}
                  STEP 1 OF 2
                </p>
                <h2
                  style={{
                    fontFamily: FONT,
                    fontSize: 'clamp(28px, 4vw, 44px)',
                    fontWeight: 800,
                    color: TEXT_HEADING,
                    lineHeight: 1,
                    margin: '0 auto',
                    textTransform: 'uppercase',
                    letterSpacing: '-0.02em',
                  }}
                >
                  ENTER YOUR BRAND METRICS
                </h2>
              </div>

              <div
                className="floating-card zt1-input-card"
                style={{ padding: '32px 28px' }}
              >
                <InputPanel
                  inputs={inputs}
                  onChange={handleInputChange}
                  onCalculate={handleCalculate}
                />
              </div>
            </>
          )}

          {/* ── Step 2: Results ─────────────────────────────── */}
          {hasCalculated && (
            <>
              <div
                className="zt1-calc-header"
                style={{ textAlign: 'center', paddingTop: 48, marginBottom: 36 }}
              >
                <p className="micro-label" style={{ marginBottom: 12 }}>
                  HIDDEN PROFITS CALCULATOR{' '}
                  <span style={{ color: INDIGO }}>{'\u25CF'}</span>{' '}
                  STEP 2 OF 2
                </p>
                <h2
                  style={{
                    fontFamily: FONT,
                    fontSize: 'clamp(28px, 4vw, 44px)',
                    fontWeight: 800,
                    color: TEXT_HEADING,
                    lineHeight: 1,
                    margin: '0 auto 20px',
                    textTransform: 'uppercase',
                    letterSpacing: '-0.02em',
                  }}
                >
                  YOUR RESULTS
                </h2>

                {/* Back button */}
                <button
                  onClick={handleBack}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: TEXT_BODY,
                    fontFamily: FONT,
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    padding: '6px 0',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = INDIGO}
                  onMouseLeave={e => e.currentTarget.style.color = TEXT_BODY}
                >
                  ← Edit Inputs
                </button>
              </div>

              <div
                id="zt1-results-panel"
                className="zt1-results-card"
                style={{
                  background: BG_GLASS,
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  borderRadius: 24,
                  padding: '32px 28px',
                  border: `1px solid ${BORDER_SUBTLE}`,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 100px rgba(0, 50, 150, 0.1)',
                }}
              >
                <ResultsVisualizer results={results} />
                <CTASection utmParams={utmParams} results={results} />
              </div>
            </>
          )}

        </div>
      </section>
    </div>
  )
}
