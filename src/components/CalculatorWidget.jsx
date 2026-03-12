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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 219 35"
          aria-label="ZeroTo1"
          style={{ height: 22, color: INDIGO, opacity: 1, filter: 'none' }}
        >
          <path d="M29.5798 25.3699V33.7262H0V25.7136L16.5977 8.85054H0.190292V0.494202H29.0301V8.50684L12.5381 25.3699H29.5798Z" fill="currentColor"/>
          <path d="M60.6399 25.1121V33.7262H32.8996V0.494202H60.0479V9.10832H44.444V13.2328H57.0244V21.181H44.444V25.1121H60.6399Z" fill="currentColor"/>
          <path d="M78.6749 22.7062H75.5034V33.7262H64.2127V0.494202H81.9522C90.6633 0.494202 95.188 4.21052 95.188 11.6217C95.188 16.498 93.2005 19.7847 89.289 21.4388L97.0275 33.7262H84.4894L78.6961 22.7062H78.6749ZM75.5034 14.9943H79.6264C82.5442 14.9943 83.6437 14.178 83.6437 11.9224C83.6437 9.66684 82.5442 8.85054 79.6264 8.85054H75.5034V14.9943Z" fill="currentColor"/>
          <path d="M130.477 17.1208C130.477 27.9905 124.282 34.2417 113.879 34.2417C103.477 34.2417 97.2392 27.9905 97.2392 17.1208C97.2392 6.25114 103.54 0 113.879 0C124.218 0 130.477 6.25114 130.477 17.1208ZM109.037 17.1208C109.037 22.9209 110.517 25.4342 113.9 25.4342C117.283 25.4342 118.7 22.9209 118.7 17.1208C118.7 11.3208 117.262 8.80745 113.9 8.80745C110.539 8.80745 109.037 11.3208 109.037 17.1208Z" fill="currentColor"/>
          <path d="M163.82 9.10832H153.608V33.7262H142.063V9.10832H131.809V0.494202H163.82V9.10832Z" fill="currentColor"/>
          <path d="M198.347 17.1208C198.347 27.9905 192.152 34.2417 181.75 34.2417C171.347 34.2417 165.11 27.9905 165.11 17.1208C165.11 6.25114 171.41 0 181.75 0C192.089 0 198.347 6.25114 198.347 17.1208ZM176.908 17.1208C176.908 22.9209 178.388 25.4342 181.771 25.4342C185.154 25.4342 186.57 22.9209 186.57 17.1208C186.57 11.3208 185.133 8.80745 181.771 8.80745C178.409 8.80745 176.908 11.3208 176.908 17.1208Z" fill="currentColor"/>
          <path d="M218.962 0.494202V33.7262H207.904V11.4713C205.769 13.3832 203.295 14.8439 200.61 15.2521L199.976 5.84312C204.035 5.392 208.496 2.87866 209.976 0.515683H218.941L218.962 0.494202Z" fill="currentColor"/>
        </svg>
        <span
          style={{
            fontFamily: FONT,
            fontSize: 16,
            fontWeight: 300,
            color: INDIGO,
          }}
        >
          {'\u00D7'}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 120 26"
          aria-label="Refunnel"
          style={{ height: 22, color: INDIGO, opacity: 1, filter: 'none' }}
        >
          <g clipPath="url(#rf_clip0)">
            <path d="M10.8718 14.7959V19.6542C10.8718 22.659 8.43848 25.0921 5.43588 25.0921C3.93588 25.0921 2.57626 24.4838 1.59359 23.4986C0.608319 22.5161 0 21.1566 0 19.6542V14.7959H10.8718Z" fill="currentColor" />
            <path d="M25.0919 5.43791C25.0919 8.4402 22.6586 10.8732 19.656 10.8732H0V0H19.656C22.6586 0 25.0919 2.43562 25.0919 5.43791Z" fill="currentColor" />
          </g>
          <g clipPath="url(#rf_clip1)">
            <path d="M38.3781 9.23438C37.2912 9.23438 36.385 9.45367 35.6552 9.89448C34.9254 10.3353 34.383 10.9305 34.0259 11.6846C33.6688 12.4387 33.4902 13.2912 33.4902 14.2467V20.6017H36.6596V14.3586C36.6596 13.703 36.8381 13.1838 37.1952 12.8034C37.5523 12.423 38.0433 12.2328 38.6683 12.2328C38.9517 12.2328 39.2486 12.2709 39.5611 12.3447C39.8735 12.4186 40.1637 12.5394 40.4315 12.7027V9.61478C40.148 9.49618 39.8289 9.4022 39.4718 9.33507C39.1147 9.26794 38.7509 9.23438 38.3781 9.23438Z" fill="currentColor" />
            <path d="M49.6936 9.89455C48.8745 9.37989 47.8791 9.12256 46.7028 9.12256C45.5266 9.12256 44.5736 9.3866 43.7121 9.91693C42.8483 10.4473 42.1765 11.1544 41.6922 12.0427C41.2078 12.931 40.9668 13.9044 40.9668 14.9628C40.9668 16.1421 41.2279 17.1736 41.748 18.062C42.268 18.9503 42.9867 19.644 43.9018 20.143C44.8169 20.642 45.848 20.8926 46.993 20.8926C48.138 20.8926 49.1981 20.6196 50.0842 20.0759C50.9703 19.5321 51.651 18.7601 52.1264 17.7599L49.6936 16.5292C49.4414 17.0371 49.0731 17.4332 48.5888 17.7152C48.1045 17.9993 47.5666 18.1403 46.9707 18.1403C46.3457 18.1403 45.8056 18.0016 45.3525 17.7263C44.8994 17.4511 44.549 17.0662 44.3035 16.574C44.1651 16.2965 44.0714 15.9989 44.0223 15.6789H52.238V14.7391C52.238 13.7254 52.0193 12.7923 51.5796 11.942C51.1399 11.0917 50.5127 10.4092 49.6936 9.89455ZM44.1584 13.9111C44.2477 13.5375 44.3995 13.1996 44.616 12.893C44.8325 12.5864 45.1137 12.3448 45.4641 12.1658C45.8145 11.9868 46.2185 11.8973 46.6805 11.8973C47.1425 11.8973 47.5219 11.9823 47.8634 12.1546C48.2049 12.3269 48.4839 12.5641 48.7004 12.8706C48.9169 13.1772 49.0463 13.524 49.091 13.9111H44.1584Z" fill="currentColor" />
            <path d="M60.1171 4.19971C59.0457 4.19971 58.153 4.40781 57.4388 4.82625C56.7245 5.24469 56.1889 5.81082 55.8318 6.52687C55.4747 7.24292 55.2961 8.04848 55.2961 8.94354V9.52533H53.332V12.2105H55.2961V20.6017H58.4654V12.2105H61.9919V9.52533H58.4654V8.89878C58.4654 8.27224 58.6395 7.80681 58.9899 7.50025C59.3404 7.19369 59.8113 7.04153 60.4072 7.04153C60.7041 7.04153 61.0098 7.07957 61.3223 7.15341C61.6348 7.22726 61.9182 7.34809 62.1704 7.51144V4.58011C61.887 4.46151 61.5678 4.36753 61.2107 4.3004C60.8536 4.23327 60.4898 4.19971 60.1171 4.19971Z" fill="currentColor" />
            <path d="M71.0084 14.6496C71.0084 15.2158 70.9191 15.7416 70.7406 16.2272C70.562 16.7127 70.2897 17.0999 69.9259 17.3908C69.5621 17.6816 69.1046 17.8271 68.5533 17.8271C68.002 17.8271 67.5668 17.6816 67.203 17.3908C66.8392 17.0999 66.5669 16.7127 66.3883 16.2272C66.2098 15.7416 66.1205 15.2247 66.1205 14.672V9.52539H62.9512V15.03C62.9512 16.1041 63.1632 17.0887 63.5873 17.9837C64.0113 18.8788 64.6407 19.5881 65.4732 20.1095C66.3057 20.6309 67.3324 20.8927 68.5533 20.8927C69.7741 20.8927 70.8231 20.6309 71.6557 20.1095C72.4882 19.5881 73.1176 18.8833 73.5416 17.9949C73.9657 17.1066 74.1777 16.1198 74.1777 15.03V9.52539H71.0084V14.6496Z" fill="currentColor" />
            <path d="M85.2374 10.0063C84.3826 9.47596 83.3068 9.21191 82.0123 9.21191C80.7177 9.21191 79.6464 9.47596 78.7983 10.0063C77.9502 10.5366 77.3141 11.2437 76.89 12.1321C76.4659 13.0204 76.2539 14.0005 76.2539 15.0746V20.6016H79.4232V15.455C79.4232 14.8732 79.5125 14.3473 79.6911 13.8774C79.8696 13.4075 80.1531 13.0271 80.5392 12.7362C80.9253 12.4453 81.4163 12.2999 82.0123 12.2999C82.6082 12.2999 83.1171 12.4453 83.4965 12.7362C83.8759 13.0271 84.1616 13.412 84.3558 13.8886C84.5499 14.3652 84.6459 14.8888 84.6459 15.455V20.6016H87.8152V15.0746C87.8152 13.9848 87.5988 13.0003 87.168 12.1209C86.7372 11.2415 86.0922 10.5366 85.2374 10.0063Z" fill="currentColor" />
            <path d="M99.0089 10.0063C98.154 9.47596 97.0783 9.21191 95.7837 9.21191C94.4892 9.21191 93.4179 9.47596 92.5698 10.0063C91.7217 10.5366 91.0856 11.2437 90.6615 12.1321C90.2374 13.0204 90.0254 14.0005 90.0254 15.0746V20.6016H93.1947V15.455C93.1947 14.8732 93.284 14.3473 93.4625 13.8774C93.6411 13.4075 93.9246 13.0271 94.3107 12.7362C94.6968 12.4453 95.1878 12.2999 95.7837 12.2999C96.3797 12.2999 96.8885 12.4453 97.268 12.7362C97.6474 13.0271 97.9331 13.412 98.1273 13.8886C98.3214 14.3652 98.4174 14.8888 98.4174 15.455V20.6016H101.587V15.0746C101.587 13.9848 101.37 13.0003 100.939 12.1209C100.509 11.2415 99.8637 10.5366 99.0089 10.0063Z" fill="currentColor" />
            <path d="M111.965 9.89455C111.146 9.37989 110.151 9.12256 108.974 9.12256C107.798 9.12256 106.847 9.3866 105.984 9.91693C105.12 10.4473 104.448 11.1544 103.964 12.0427C103.479 12.931 103.238 13.9044 103.238 14.9628C103.238 16.1421 103.499 17.1736 104.019 18.062C104.539 18.9503 105.258 19.644 106.173 20.143C107.088 20.642 108.119 20.8926 109.264 20.8926C110.409 20.8926 111.47 20.6196 112.356 20.0759C113.24 19.5321 113.922 18.7601 114.398 17.7599L111.965 16.5292C111.713 17.0371 111.342 17.4332 110.86 17.7152C110.376 17.9993 109.838 18.1403 109.242 18.1403C108.617 18.1403 108.077 18.0016 107.624 17.7263C107.171 17.4511 106.821 17.0662 106.575 16.574C106.437 16.2965 106.343 15.9989 106.294 15.6789H114.509V14.7391C114.509 13.7254 114.291 12.7923 113.851 11.942C113.411 11.0917 112.784 10.4092 111.965 9.89455ZM106.428 13.9111C106.517 13.5375 106.669 13.1996 106.885 12.893C107.1 12.5864 107.383 12.3448 107.733 12.1658C108.084 11.9868 108.488 11.8973 108.95 11.8973C109.412 11.8973 109.791 11.9823 110.133 12.1546C110.474 12.3269 110.753 12.5641 110.97 12.8706C111.186 13.1772 111.316 13.524 111.36 13.9111H106.428Z" fill="currentColor" />
            <path d="M119.999 4.42334H116.83V20.6016H119.999V4.42334Z" fill="currentColor" />
          </g>
          <defs>
            <clipPath id="rf_clip0">
              <rect width="25.0919" height="25.0919" fill="white" />
            </clipPath>
            <clipPath id="rf_clip1">
              <rect width="86.5092" height="16.6929" fill="white" transform="translate(33.4902 4.19971)" />
            </clipPath>
          </defs>
        </svg>
      </div>
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
                  boxShadow: '0 8px 32px rgba(79, 70, 229, 0.06), 0 1px 4px rgba(0, 0, 0, 0.04)',
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
