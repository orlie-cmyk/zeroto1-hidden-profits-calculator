import { useState, useCallback, useRef, useEffect } from 'react'
import { Zap, HelpCircle, Shield, ChevronDown, ChevronUp } from 'lucide-react'
import { BENCHMARKS } from '../benchmarks.js'
import {
  FONT, INDIGO, INDIGO_LIGHT, BG_CARD, TEXT_HEADING, TEXT_BODY, BORDER_SUBTLE,
} from '../tokens.js'

/* ================================================================
   FIELD TOOLTIP DESCRIPTIONS
   ================================================================ */
const FIELD_TOOLTIPS = {
  tiktokGMV: "Your total monthly sales on TikTok Shop — including organic, paid, and affiliate sales combined",
  tiktokAdSpend: "How much you spend monthly on TikTok ads specifically",
  tiktokROI: "For every $1 you spend on TikTok ads, how many dollars in sales do you generate?",
  affiliateShare: "What percentage of your TikTok Shop sales come from affiliate creators promoting your products?",
  avgSampleCost: "How much does it cost you to send a product sample to one affiliate creator?",
  metaAdSpend: "Your total monthly spend on Meta (Facebook/Instagram) ads",
  metaROAS: "For every $1 you spend on Meta ads, how many dollars in revenue do you get back?",
  metaCPM: "Cost per 1,000 impressions — how much Meta charges you to show your ads 1,000 times",
  metaCTR: "Click-through rate — what percentage of people who see your ad actually click on it",
  metaCAC: "Customer Acquisition Cost — how much it costs you to acquire one new customer through Meta",
  costPerCreative: "How much you currently pay to produce a single ad creative (video or image) from an agency or freelancer",
}

/* ================================================================
   FIELD DEFINITIONS
   ================================================================ */

// Essential fields — always visible
const ESSENTIAL_FIELDS = [
  { key: 'tiktokGMV', label: 'Total TikTok Shop GMV (monthly)', min: 10000, max: 2000000, step: 5000, prefix: '$', suffix: null },
  { key: 'metaAdSpend', label: 'Meta Ad Spend (monthly)', min: 10000, max: 5000000, step: 5000, prefix: '$', suffix: null },
  { key: 'metaCAC', label: 'Current Meta CAC', min: 5, max: 500, step: 1, prefix: '$', suffix: null },
]

// Advanced fields — hidden behind toggle
const ADVANCED_FIELDS = [
  { key: 'tiktokAdSpend', label: 'TikTok Ad Spend (monthly)', min: 1000, max: 500000, step: 1000, prefix: '$', suffix: null },
  { key: 'tiktokROI', label: 'TikTok GMV Max ROI', min: 0.5, max: 10, step: 0.1, prefix: null, suffix: 'x' },
  { key: 'affiliateShare', label: 'Affiliate Share of GMV', note: 'Percentage of GMV from affiliate creators', min: 10, max: 100, step: 5, prefix: null, suffix: '%' },
  { key: 'avgSampleCost', label: 'Avg Sample Cost', min: 1, max: 100, step: 1, prefix: '$', suffix: null },
  { key: 'metaROAS', label: 'Current Meta ROAS', min: 0.5, max: 10, step: 0.01, prefix: null, suffix: 'x' },
  { key: 'metaCPM', label: 'Current Meta CPM', min: 1, max: 50, step: 0.5, prefix: '$', suffix: null },
  { key: 'metaCTR', label: 'Current Meta CTR', min: 0.1, max: 10, step: 0.1, prefix: null, suffix: '%' },
  { key: 'costPerCreative', label: 'Cost Per Creative Asset', min: 50, max: 5000, step: 50, prefix: '$', suffix: null },
]

/* ================================================================
   FORMAT HELPERS
   ================================================================ */
function formatDisplayValue(value, prefix, suffix) {
  if (value == null || isNaN(Number(value))) return ''
  const num = Number(value)
  if (prefix === '$') {
    if (num % 1 === 0) return num.toLocaleString('en-US', { maximumFractionDigits: 0 })
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  if (suffix === 'x' || suffix === '%') return parseFloat(num.toFixed(2)).toString()
  return num.toLocaleString('en-US')
}

function formatRangeLabel(value, prefix, suffix) {
  if (prefix === '$') {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`
    return `$${value}`
  }
  if (suffix) return `${value}${suffix}`
  return String(value)
}

/* ================================================================
   TOOLTIP COMPONENT
   ================================================================ */
function InfoTooltip({ text }) {
  const [show, setShow] = useState(false)
  const tooltipRef = useRef(null)
  const triggerRef = useRef(null)

  useEffect(() => {
    if (!show) return
    const handler = (e) => {
      if (
        tooltipRef.current && !tooltipRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) {
        setShow(false)
      }
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [show])

  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', marginLeft: 5 }}>
      <span
        ref={triggerRef}
        role="button"
        tabIndex={0}
        aria-label="More info"
        onClick={(e) => { e.stopPropagation(); setShow(!show) }}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: 'rgba(255,235,3,0.06)',
          cursor: 'pointer',
          transition: 'background 0.15s',
          flexShrink: 0,
          minWidth: 44,
          minHeight: 44,
          padding: 0,
        }}
      >
        <HelpCircle size={13} color={INDIGO} strokeWidth={2.5} />
      </span>

      {show && (
        <span
          ref={tooltipRef}
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: BG_CARD,
            color: TEXT_HEADING,
            fontSize: 12,
            fontWeight: 500,
            lineHeight: 1.5,
            padding: '10px 14px',
            borderRadius: 10,
            width: 240,
            maxWidth: '80vw',
            boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
            zIndex: 100,
            fontFamily: FONT,
            pointerEvents: 'auto',
            animation: 'tooltipFadeIn 0.15s ease-out',
            border: `1px solid ${BORDER_SUBTLE}`,
          }}
        >
          {text}
          <span
            style={{
              position: 'absolute',
              bottom: -5,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 10,
              height: 10,
              background: BG_CARD,
              borderRadius: 2,
              rotate: '45deg',
            }}
          />
        </span>
      )}
    </span>
  )
}

/* ================================================================
   DEFAULT BADGE
   ================================================================ */
function DefaultBadge({ fieldKey, currentValue }) {
  const defaultVal = BENCHMARKS.defaults[fieldKey]
  if (defaultVal == null || currentValue !== defaultVal) return null

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        fontSize: 10,
        fontWeight: 600,
        color: INDIGO,
        background: 'rgba(255,235,3,0.06)',
        borderRadius: 6,
        padding: '2px 8px',
        marginLeft: 8,
        letterSpacing: '0.02em',
        fontFamily: FONT,
        whiteSpace: 'nowrap',
        lineHeight: 1.4,
      }}
    >
      Industry avg
    </span>
  )
}

/* ================================================================
   SLIDER FIELD
   ================================================================ */
function SliderField({ fieldDef, value, onChange }) {
  const { key, label, note, min, max, step, prefix, suffix } = fieldDef
  const [localValue, setLocalValue] = useState(String(value))
  const [isFocused, setIsFocused] = useState(false)
  const [isSliding, setIsSliding] = useState(false)
  const inputRef = useRef(null)

  if (!isFocused && String(value) !== localValue) {
    setLocalValue(String(value))
  }

  const handleSlider = useCallback((e) => {
    const v = parseFloat(e.target.value)
    onChange(key, v)
    setLocalValue(String(v))
  }, [key, onChange])

  const handleSliderStart = useCallback(() => setIsSliding(true), [])
  const handleSliderEnd = useCallback(() => setIsSliding(false), [])

  const handleInputChange = useCallback((e) => { setLocalValue(e.target.value) }, [])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
    const raw = localValue.replace(/[^0-9.\-]/g, '')
    const parsed = parseFloat(raw)
    if (!isNaN(parsed)) {
      const clamped = Math.min(Math.max(parsed, min), max)
      onChange(key, clamped)
      setLocalValue(String(clamped))
    } else {
      setLocalValue(String(value))
    }
  }, [localValue, key, min, max, value, onChange])

  const handleFocus = useCallback(() => {
    setIsFocused(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }, [])

  const handleKeyDown = useCallback((e) => { if (e.key === 'Enter') e.target.blur() }, [])

  const pct = ((value - min) / (max - min)) * 100
  const displayValue = isFocused ? localValue : formatDisplayValue(value, prefix, suffix)

  const bubbleText = (() => {
    if (prefix === '$') {
      const num = Number(value)
      if (num >= 1000000) return `$${(num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1)}M`
      if (num >= 1000) return `$${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}K`
      return `$${num}`
    }
    if (suffix) return `${parseFloat(Number(value).toFixed(2))}${suffix}`
    return String(value)
  })()

  const tooltip = FIELD_TOOLTIPS[key]

  return (
    <div className="slider-field-wrapper" style={{ marginBottom: 20, position: 'relative' }}>
      {/* Label row */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', marginBottom: note ? 2 : 8 }}>
        <label
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: TEXT_HEADING,
            cursor: 'pointer',
            fontFamily: FONT,
            letterSpacing: '0.01em',
            lineHeight: 1.4,
          }}
          onClick={() => inputRef.current?.focus()}
        >
          {label}
        </label>
        {tooltip && <InfoTooltip text={tooltip} />}
        <DefaultBadge fieldKey={key} currentValue={value} />
      </div>

      {note && (
        <span style={{ display: 'block', fontSize: 11, color: TEXT_BODY, marginBottom: 8, fontFamily: FONT }}>
          {note}
        </span>
      )}

      {/* Input container */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          background: BG_CARD,
          border: `1.5px solid ${isFocused ? INDIGO : BORDER_SUBTLE}`,
          borderRadius: 12,
          padding: '10px 14px',
          minHeight: 48,
          transition: 'border-color 0.15s, box-shadow 0.15s',
          boxShadow: isFocused ? '0 0 0 3px rgba(255,235,3,0.12)' : 'none',
        }}
      >
        {prefix && (
          <span style={{
            fontSize: 14, color: TEXT_BODY, marginRight: 4, userSelect: 'none',
            fontWeight: 600, fontFamily: FONT,
          }}>
            {prefix}
          </span>
        )}
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: 16,
            fontWeight: 700,
            color: TEXT_HEADING,
            textAlign: 'right',
            fontFamily: FONT,
            width: '100%',
            minHeight: 28,
          }}
        />
        {suffix && (
          <span style={{
            fontSize: 14, color: TEXT_BODY, marginLeft: 4, userSelect: 'none',
            fontWeight: 600, fontFamily: FONT,
          }}>
            {suffix}
          </span>
        )}
      </div>

      {/* Slider with floating value bubble — fixed-height wrapper to prevent layout shift */}
      <div style={{ position: 'relative', marginTop: 10 }}>
        {/* Bubble area: always 24px tall so slider never moves */}
        <div style={{ height: 24, position: 'relative', marginBottom: 4 }}>
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: `calc(${pct}% - 20px + ${(1 - pct / 100) * 8}px)`,
              background: BG_CARD,
              color: INDIGO,
              fontSize: 11,
              fontWeight: 700,
              fontFamily: FONT,
              padding: '2px 7px',
              borderRadius: 6,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 10,
              border: '1px solid rgba(255,255,255,0.08)',
              opacity: isSliding ? 1 : 0,
              transition: 'opacity 0.15s ease',
            }}
          >
            {bubbleText}
          </div>
        </div>

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSlider}
          onMouseDown={handleSliderStart}
          onMouseUp={handleSliderEnd}
          onTouchStart={handleSliderStart}
          onTouchEnd={handleSliderEnd}
          style={{
            width: '100%',
            height: 6,
            appearance: 'none',
            WebkitAppearance: 'none',
            borderRadius: 3,
            outline: 'none',
            cursor: 'pointer',
            background: `linear-gradient(to right, ${INDIGO} 0%, ${INDIGO_LIGHT} ${pct}%, ${BORDER_SUBTLE} ${pct}%, ${BORDER_SUBTLE} 100%)`,
          }}
        />
      </div>

      {/* Range labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 11, color: TEXT_BODY, fontFamily: FONT }}>{formatRangeLabel(min, prefix, suffix)}</span>
        <span style={{ fontSize: 11, color: TEXT_BODY, fontFamily: FONT }}>{formatRangeLabel(max, prefix, suffix)}</span>
      </div>
    </div>
  )
}

/* ================================================================
   PRIVACY NOTICE
   ================================================================ */
function PrivacyNotice() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: '8px 14px',
        marginBottom: 24,
        background: 'rgba(255,235,3,0.05)',
        border: '1px solid rgba(255,235,3,0.12)',
        borderRadius: 10,
      }}
    >
      <Shield size={13} color={INDIGO} strokeWidth={2.5} />
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: INDIGO,
          fontFamily: FONT,
          letterSpacing: '0.01em',
        }}
      >
        Your data stays in your browser
      </span>
    </div>
  )
}

/* ================================================================
   MAIN COMPONENT — InputPanel
   ================================================================ */
export default function InputPanel({ inputs, onChange, onCalculate }) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  return (
    <div style={{ fontFamily: FONT }}>

      {/* Scoped styles */}
      <style>{`
        @keyframes tooltipFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 4px 20px rgba(255,235,3,0.25); }
          50% { box-shadow: 0 4px 30px rgba(255,235,3,0.40), 0 0 40px rgba(255,235,3,0.10); }
        }

        .slider-field-wrapper input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #FFEB03;
          cursor: grab;
          border: 3px solid #171717;
          box-shadow: 0 2px 8px rgba(255,235,3,0.25);
          transition: box-shadow 0.2s, transform 0.15s;
        }

        .slider-field-wrapper input[type="range"]::-webkit-slider-thumb:hover {
          box-shadow: 0 0 0 6px rgba(255,235,3,0.12);
          transform: scale(1.1);
        }

        .slider-field-wrapper input[type="range"]::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(1.15);
          box-shadow: 0 0 0 10px rgba(255,235,3,0.15);
        }

        .slider-field-wrapper input[type="range"]::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #FFEB03;
          cursor: grab;
          border: 3px solid #171717;
          box-shadow: 0 2px 8px rgba(255,235,3,0.25);
        }

        .slider-field-wrapper input[type="range"]::-moz-range-progress {
          background: linear-gradient(90deg, #FFEB03, #FFF04D);
          border-radius: 3px;
          height: 6px;
        }

        .slider-field-wrapper input[type="range"]::-moz-range-track {
          background: rgba(255,255,255,0.06);
          border-radius: 3px;
          height: 6px;
        }

        /* ── MOBILE OVERRIDES ── */
        @media (max-width: 900px) {
          .slider-field-wrapper {
            margin-bottom: 28px !important;
          }

          .slider-field-wrapper input[type="range"]::-webkit-slider-thumb {
            width: 28px !important;
            height: 28px !important;
          }

          .slider-field-wrapper input[type="range"]::-moz-range-thumb {
            width: 28px !important;
            height: 28px !important;
          }

          .cta-sticky-wrapper {
            position: sticky !important;
            bottom: 0;
            z-index: 20;
            background: rgba(0,0,0,0.90);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            margin-left: -28px !important;
            margin-right: -28px !important;
            padding: 16px 28px !important;
            border-top: 1px solid rgba(255,255,255,0.1);
          }
        }
      `}</style>

      {/* Privacy Notice */}
      <PrivacyNotice />

      {/* ═══════════════════════════════════════════════════════════
         ESSENTIAL INPUTS — Always visible
         ═══════════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: 24 }}>
        {ESSENTIAL_FIELDS.map((field) => (
          <SliderField
            key={field.key}
            fieldDef={field}
            value={inputs[field.key]}
            onChange={onChange}
          />
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════
         ADVANCED SETTINGS TOGGLE
         ═══════════════════════════════════════════════════════════ */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          width: '100%',
          background: 'transparent',
          border: `2px solid ${BORDER_SUBTLE}`,
          borderRadius: 40,
          padding: '10px 20px',
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 13,
          color: TEXT_HEADING,
          textTransform: 'uppercase',
          letterSpacing: '2px',
          cursor: 'pointer',
          transition: 'all 200ms ease',
          marginBottom: 24,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = INDIGO; e.currentTarget.style.color = INDIGO }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = BORDER_SUBTLE; e.currentTarget.style.color = TEXT_HEADING }}
      >
        ADVANCED SETTINGS
        <span style={{ fontWeight: 400, fontSize: 10, letterSpacing: '1px', opacity: 0.55, marginLeft: 8, textTransform: 'none' }}>(Optional)</span>
        {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {/* ═══════════════════════════════════════════════════════════
         ADVANCED INPUTS — Conditionally visible
         ═══════════════════════════════════════════════════════════ */}
      {showAdvanced && (
        <div style={{ marginBottom: 24 }}>
          {ADVANCED_FIELDS.map((field) => (
            <SliderField
              key={field.key}
              fieldDef={field}
              value={inputs[field.key]}
              onChange={onChange}
            />
          ))}
        </div>
      )}

      {/* ── CTA Button ── */}
      <div className="cta-sticky-wrapper">
        <button
          onClick={onCalculate}
          className="btn-cta"
          style={{
            width: '100%',
            fontSize: 16,
            padding: '14px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            minHeight: 54,
          }}
        >
          <Zap size={18} fill="#000000" stroke="#000000" />
          {'CALCULATE \u2192'}
        </button>
      </div>
    </div>
  )
}
