/**
 * ResultsVisualizer.jsx
 * Refunnel — Hidden Profits Calculator
 *
 * Light-mode, Electric Indigo themed results panel with 5 headline stat cards.
 */

import { useEffect, useRef, useState } from 'react';
import {
  TrendingUp,
  BarChart3,
  Sparkles,
  Shield,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Video,
} from 'lucide-react';
import {
  formatCurrency,
  formatROAS,
  formatPct,
  formatCAC,
  formatNumber,
  formatCompact,
} from '../mathEngine.js';
import {
  FONT, INDIGO, INDIGO_LIGHT, INDIGO_MUTED,
  BG_BASE, BG_CARD, TEXT_HEADING, TEXT_BODY, BORDER_SUBTLE,
} from '../tokens.js';
import RevenueRampChart from './RevenueRampChart.jsx';

// Breakdown bar colors
const HALO_COLOR = INDIGO;
const META_COLOR = INDIGO_LIGHT;
const CONTENT_COLOR = INDIGO_MUTED;

/* ── Global CSS ────────────────────────────────────────────────── */
const GLOBAL_STYLES = `
  @keyframes rv-fadeInUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes rv-scaleReveal {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }

  .rv-animate-section {
    opacity: 0;
    animation: rv-fadeInUp 0.6s ease forwards;
  }

  .rv-animate-card {
    opacity: 0;
    animation: rv-scaleReveal 0.5s ease forwards;
  }

  /* Headline Cards: 4-col on desktop, 2x2 on tablet, 1-col mobile */
  [data-section="headline-stats"] .rv-headline-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
  }

  /* Prevent grid items from overflowing due to min-content size */
  [data-section="headline-stats"] .rv-headline-grid > * {
    min-width: 0;
  }

  @media (max-width: 1100px) {
    [data-section="headline-stats"] .rv-headline-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 639px) {
    [data-section="headline-stats"] .rv-headline-grid {
      grid-template-columns: 1fr;
    }
  }

  .rv-card-number {
    font-size: 24px;
  }
  @media (min-width: 640px) {
    .rv-card-number {
      font-size: 28px;
    }
  }

  /* Halo bars thicker on mobile */
  @media (max-width: 639px) {
    [data-section="halo-breakdown"] .rv-bar-track,
    [data-section="halo-breakdown"] .rv-bar-fill {
      height: 12px !important;
    }
  }

  /* Meta: table on desktop, cards on mobile */
  [data-section="meta-comparison"] .rv-meta-table { display: block; }
  [data-section="meta-comparison"] .rv-meta-cards { display: none; }

  @media (max-width: 639px) {
    [data-section="meta-comparison"] .rv-meta-table { display: none; }
    [data-section="meta-comparison"] .rv-meta-cards {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  }

  /* Content Engine: 2-col desktop, 1-col mobile */
  [data-section="content-engine"] .rv-content-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }
  @media (max-width: 639px) {
    [data-section="content-engine"] .rv-content-grid {
      grid-template-columns: 1fr;
    }
  }

  /* Annual Projection mobile */
  @media (max-width: 639px) {
    [data-section="annual-projection"] .rv-annual-inner {
      padding: 32px 20px !important;
    }
  }

  /* Prevent horizontal overflow */
  .rv-results-root {
    overflow-x: hidden;
    max-width: 100%;
  }
  .rv-results-root * {
    max-width: 100%;
    box-sizing: border-box;
  }
`;

/* ── Hook: useInView ───────────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isVisible];
}

/* ── AnimatedSection ───────────────────────────────────────────── */
function AnimatedSection({ children, delay = 0, dataSection, style = {} }) {
  const [ref, isVisible] = useInView(0.1);

  return (
    <div
      ref={ref}
      data-section={dataSection}
      className={isVisible ? 'rv-animate-section' : ''}
      style={{
        ...style,
        opacity: isVisible ? undefined : 0,
        animationDelay: isVisible ? `${delay}ms` : undefined,
      }}
    >
      {children}
    </div>
  );
}

/* ── Icon Badge ────────────────────────────────────────────────── */
function IconBadge({ Icon }) {
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        backgroundColor: 'rgba(79,70,229,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon size={18} color={INDIGO} />
    </div>
  );
}

/* ── Source Badge ───────────────────────────────────────────────── */
function SourceBadge({ text }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        marginTop: 16,
        padding: '6px 14px',
        borderRadius: 9999,
        border: `1px solid ${BORDER_SUBTLE}`,
        backgroundColor: BG_CARD,
        fontSize: 11,
        color: TEXT_BODY,
        fontFamily: FONT,
      }}
    >
      <Shield size={11} color={TEXT_BODY} />
      {text}
    </div>
  );
}

/* ── Section Number Badge ──────────────────────────────────────── */
function SectionNumber({ number }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: INDIGO,
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: 900,
        fontFamily: FONT,
        flexShrink: 0,
        letterSpacing: '0.02em',
      }}
    >
      {String(number).padStart(2, '0')}
    </span>
  );
}

/* ── Section Title ─────────────────────────────────────────────── */
function SectionTitle({ icon: Icon, children, number }) {
  return (
    <h3
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontSize: 18,
        fontWeight: 800,
        color: TEXT_HEADING,
        fontFamily: FONT,
        margin: 0,
        marginBottom: 20,
        textTransform: 'uppercase',
        letterSpacing: '-0.02em',
      }}
    >
      {number !== undefined && <SectionNumber number={number} />}
      <Icon size={20} color={INDIGO} />
      {children}
    </h3>
  );
}

/* ── Narrative Block ───────────────────────────────────────────── */
function NarrativeBlock({ children }) {
  return (
    <p
      className="rv-narrative-block"
      style={{
        fontSize: 13,
        color: TEXT_BODY,
        lineHeight: 1.7,
        marginBottom: 22,
        padding: '14px 16px',
        backgroundColor: BG_CARD,
        borderRadius: 10,
        border: `1px solid ${BORDER_SUBTLE}`,
        fontFamily: FONT,
      }}
    >
      {children}
    </p>
  );
}

/* ── PlainEnglish Block ────────────────────────────────────────── */
function PlainEnglish({ children }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
        padding: '14px 16px',
        backgroundColor: 'rgba(79,70,229,0.05)',
        borderRadius: 10,
        border: '1px solid rgba(79,70,229,0.12)',
        marginTop: 18,
        marginBottom: 4,
      }}
    >
      <Sparkles size={16} color={INDIGO} style={{ flexShrink: 0, marginTop: 2 }} />
      <p
        style={{
          fontSize: 14,
          color: TEXT_BODY,
          lineHeight: 1.65,
          margin: 0,
          fontFamily: FONT,
          fontWeight: 500,
        }}
      >
        <span style={{ fontWeight: 700, color: INDIGO, marginRight: 4 }}>
          In plain English:
        </span>
        {children}
      </p>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════════ */
/*  SECTION 0 — Executive Summary                                   */
/* ══════════════════════════════════════════════════════════════════ */
function ExecutiveSummary({ results }) {
  const { combined, halo, meta, content } = results;
  const monthly = combined.totalMonthlyOpportunity;
  const annual = combined.totalAnnualOpportunity;

  const tiktokGMV = combined.tiktokGMV || 0;
  const haloVal = halo.totalHaloRevenue;
  const metaVal = meta.incrementalMetaRev + meta.totalCPASavings;
  const contentVal = content.contentCostSavings;
  const grandTotal = tiktokGMV + haloVal + metaVal + contentVal;

  const tiktokPct = grandTotal > 0 ? (tiktokGMV / grandTotal) * 100 : 25;
  const haloPct = grandTotal > 0 ? (haloVal / grandTotal) * 100 : 25;
  const metaPct = grandTotal > 0 ? (metaVal / grandTotal) * 100 : 25;
  const contentPct = grandTotal > 0 ? (contentVal / grandTotal) * 100 : 25;

  return (
    <div
      data-section="executive-summary"
      style={{
        background: BG_CARD,
        borderRadius: 16,
        padding: '36px 28px',
        border: `2px solid ${INDIGO}`,
        marginBottom: 28,
        fontFamily: FONT,
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
        boxShadow: '0 4px 24px rgba(79,70,229,0.08)',
      }}
    >
      {/* Label */}
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: INDIGO,
          textTransform: 'uppercase',
          letterSpacing: '3px',
          margin: 0,
          marginBottom: 10,
          fontFamily: FONT,
        }}
      >
        YOUR TOTAL OPPORTUNITY {'\u25CF'}
      </p>

      {/* Big monthly number */}
      <p
        style={{
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 'clamp(36px, 7vw, 52px)',
          color: INDIGO,
          margin: 0,
          lineHeight: 1,
          letterSpacing: '-2px',
          textTransform: 'uppercase',
        }}
      >
        {formatCurrency(monthly)}<span style={{ fontSize: '0.45em', fontWeight: 600, color: INDIGO_LIGHT }}>/MO</span><span style={{ fontSize: '0.4em', fontWeight: 400, color: TEXT_BODY, verticalAlign: 'super', marginLeft: '0.15em' }}>*</span>
      </p>

      {/* Annual */}
      <p
        style={{
          fontSize: 17,
          fontWeight: 600,
          color: TEXT_BODY,
          margin: 0,
          marginTop: 10,
          fontFamily: FONT,
        }}
      >
        = <span style={{ color: INDIGO, fontWeight: 700 }}>{formatCompact(annual)}/year</span> you're leaving on the table
      </p>

      {/* Breakdown Bar */}
      <div style={{ marginTop: 28 }}>
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: 14,
            borderRadius: 7,
            overflow: 'hidden',
            backgroundColor: BORDER_SUBTLE,
          }}
        >
          <div style={{ width: `${tiktokPct}%`, height: '100%', backgroundColor: '#94A3B8', transition: 'width 0.8s ease' }} />
          <div style={{ width: `${haloPct}%`, height: '100%', backgroundColor: HALO_COLOR, transition: 'width 0.8s ease' }} />
          <div style={{ width: `${metaPct}%`, height: '100%', backgroundColor: META_COLOR, transition: 'width 0.8s ease' }} />
          <div style={{ width: `${contentPct}%`, height: '100%', backgroundColor: CONTENT_COLOR, transition: 'width 0.8s ease' }} />
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'TikTok GMV', color: '#94A3B8', value: tiktokGMV },
            { label: 'Halo Effect', color: HALO_COLOR, value: haloVal },
            { label: 'Meta Lift', color: META_COLOR, value: metaVal },
            { label: 'Content Savings', color: CONTENT_COLOR, value: contentVal },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: item.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: TEXT_BODY, fontWeight: 500 }}>{item.label}</span>
              <span style={{ fontSize: 12, color: TEXT_HEADING, fontWeight: 700 }}>{formatCompact(item.value)}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 10, color: TEXT_BODY, marginTop: 10, marginBottom: 0, fontStyle: 'italic', lineHeight: 1.5, opacity: 0.8 }}>
          *Based on average program performance after 3–6 months of building.
        </p>
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════════ */
/*  SECTION A — Headline Stat Cards (5 cards including CPA savings) */
/* ══════════════════════════════════════════════════════════════════ */
function HeadlineStats({ results }) {
  const cards = [
    {
      label: 'HIDDEN HALO REVENUE',
      value: formatCurrency(results.halo.totalHaloRevenue),
      suffix: '/MO',
      subtitle: 'Amazon + DTC Halo Effect',
      Icon: TrendingUp,
      accent: false,
    },
    {
      label: 'INCREMENTAL META REVENUE',
      value: formatCurrency(results.meta.incrementalMetaRev),
      suffix: '/MO',
      subtitle: 'From Partner Ads',
      Icon: BarChart3,
      accent: false,
    },
    {
      label: 'META CPA SAVINGS',
      value: formatCurrency(results.meta.totalCPASavings),
      suffix: '/MO',
      subtitle: '-11% acquisition cost',
      Icon: ArrowDownRight,
      accent: false,
    },
    {
      label: 'CONTENT COST SAVINGS',
      value: formatCurrency(results.content.contentCostSavings),
      suffix: '/MO',
      subtitle: `${Math.round(results.content.costReductionPct * 100)}% cost reduction`,
      Icon: Sparkles,
      accent: false,
    },
  ];

  const totalCard = {
    label: 'TOTAL MONTHLY OPPORTUNITY',
    value: formatCurrency(results.combined.totalMonthlyOpportunity),
    suffix: '/MO',
    subtitle: 'Combined monthly value',
    Icon: DollarSign,
    accent: true,
  };

  return (
    <div data-section="headline-stats" style={{ marginBottom: 28 }}>
      {/* 4 individual cards */}
      <div className="rv-headline-grid">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="rv-animate-card"
            style={{
              backgroundColor: BG_CARD,
              borderRadius: 16,
              padding: 20,
              boxShadow: '0 4px 16px rgba(79,70,229,0.06)',
              border: `1px solid ${BORDER_SUBTLE}`,
              fontFamily: FONT,
              animationDelay: `${idx * 100}ms`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
              <IconBadge Icon={card.Icon} />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: INDIGO,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  fontFamily: FONT,
                  lineHeight: 1.3,
                  wordBreak: 'break-word',
                  minWidth: 0,
                }}
              >
                {card.label}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 4 }}>
              <span
                className="rv-card-number"
                style={{
                  fontFamily: FONT,
                  fontWeight: 900,
                  color: INDIGO,
                  lineHeight: 1.1,
                }}
              >
                {card.value}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: INDIGO_LIGHT, fontFamily: FONT }}>
                {card.suffix}
              </span>
            </div>

            <span style={{ fontSize: 12, color: TEXT_BODY, fontFamily: FONT }}>{card.subtitle}</span>
          </div>
        ))}
      </div>

      {/* Total card — full width, highlighted */}
      <div
        className="rv-animate-card"
        style={{
          marginTop: 14,
          backgroundColor: BG_CARD,
          borderRadius: 16,
          padding: '22px 24px',
          boxShadow: '0 4px 16px rgba(79,70,229,0.06)',
          border: `1px solid ${BORDER_SUBTLE}`,
          borderLeft: `4px solid ${INDIGO}`,
          fontFamily: FONT,
          animationDelay: '400ms',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <IconBadge Icon={totalCard.Icon} />
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: INDIGO,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              fontFamily: FONT,
            }}
          >
            {totalCard.label}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span
            style={{
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 32,
              color: INDIGO,
              lineHeight: 1,
            }}
          >
            {totalCard.value}
          </span>
          <span style={{ fontSize: 14, fontWeight: 700, color: INDIGO_LIGHT, fontFamily: FONT }}>
            {totalCard.suffix}
          </span>
        </div>
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════════ */
/*  SECTION B — Halo Effect Breakdown (01)                          */
/* ══════════════════════════════════════════════════════════════════ */
function HaloBreakdown({ results }) {
  const { halo } = results;

  const amazonPct = halo.totalHaloRevenue > 0 ? (halo.hiddenAmazonRevenue / halo.totalHaloRevenue) * 100 : 0;
  const dtcPct = halo.totalHaloRevenue > 0 ? (halo.hiddenDTCRevenue / halo.totalHaloRevenue) * 100 : 0;

  const haloMultiplier = halo.totalHaloRevenue > 0
    ? (halo.hiddenAmazonRevenue + halo.hiddenDTCRevenue) / (halo.hiddenAmazonRevenue / 0.62)
    : 0.87;

  return (
    <AnimatedSection delay={100} dataSection="halo-breakdown">
      <div
        style={{
          backgroundColor: BG_CARD,
          borderRadius: 16,
          padding: 26,
          border: `1px solid ${BORDER_SUBTLE}`,
          marginBottom: 20,
          fontFamily: FONT,
        }}
      >
        <SectionTitle icon={TrendingUp} number={1}>HALO EFFECT BREAKDOWN</SectionTitle>

        <NarrativeBlock>
          Based on your TikTok Shop GMV, you are likely driving an additional{' '}
          <strong style={{ color: INDIGO }}>{formatCurrency(halo.hiddenAmazonRevenue)}/mo</strong> on Amazon
          and <strong style={{ color: INDIGO }}>{formatCurrency(halo.hiddenDTCRevenue)}/mo</strong> on your
          DTC site that you cannot see in your current reporting. That is{' '}
          <strong style={{ color: INDIGO }}>{formatCurrency(halo.annualHaloRevenue)}/year</strong> in hidden revenue.
        </NarrativeBlock>

        {/* Amazon Halo Bar */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: TEXT_HEADING }}>Amazon Halo</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: INDIGO }}>{formatCurrency(halo.hiddenAmazonRevenue)}</span>
          </div>
          <div className="rv-bar-track" style={{ width: '100%', height: 10, borderRadius: 5, backgroundColor: BORDER_SUBTLE, overflow: 'hidden' }}>
            <div className="rv-bar-fill" style={{ width: `${amazonPct}%`, height: '100%', borderRadius: 5, backgroundColor: INDIGO, transition: 'width 0.6s ease' }} />
          </div>
          <span style={{ fontSize: 12, color: TEXT_BODY, marginTop: 3, display: 'block' }}>62% of TikTok GMV</span>
        </div>

        {/* DTC Halo Bar */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: TEXT_HEADING }}>DTC Halo</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: INDIGO }}>{formatCurrency(halo.hiddenDTCRevenue)}</span>
          </div>
          <div className="rv-bar-track" style={{ width: '100%', height: 10, borderRadius: 5, backgroundColor: BORDER_SUBTLE, overflow: 'hidden' }}>
            <div className="rv-bar-fill" style={{ width: `${dtcPct}%`, height: '100%', borderRadius: 5, backgroundColor: INDIGO, opacity: 0.65, transition: 'width 0.6s ease' }} />
          </div>
          <span style={{ fontSize: 12, color: TEXT_BODY, marginTop: 3, display: 'block' }}>25% of TikTok GMV</span>
        </div>

        {/* Total */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: `1px solid ${BORDER_SUBTLE}`, marginBottom: 14 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: TEXT_HEADING }}>Total Hidden Revenue</span>
          <span style={{ fontSize: 24, fontWeight: 900, color: INDIGO, fontFamily: FONT }}>{formatCurrency(halo.totalHaloRevenue)}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 14, color: TEXT_BODY }}>New Customers Missed</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: TEXT_HEADING }}>{formatNumber(halo.newCustomersMissed)}/mo</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 14, color: TEXT_BODY }}>Annual Projection</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: INDIGO }}>{formatCurrency(halo.annualHaloRevenue)}</span>
        </div>

        <SourceBadge text="Data from Fospha Halo Report" />

        <PlainEnglish>
          For every $1 in TikTok Shop sales, you're generating an extra ${haloMultiplier.toFixed(2)} in
          sales on Amazon and your website that standard analytics can't track.
        </PlainEnglish>
      </div>
    </AnimatedSection>
  );
}


/* ══════════════════════════════════════════════════════════════════ */
/*  SECTION C — Meta Before/After Comparison (02)                   */
/* ══════════════════════════════════════════════════════════════════ */
function MetaComparison({ results }) {
  const { meta, content } = results;

  const currentROAS = meta.newMetaROAS / 1.20;
  const currentCAC = meta.newMetaCAC / 0.89;
  const currentCTR = meta.newMetaCTR / 1.58;
  const costPerCreative = content.convertingVideos > 0 ? content.traditionalCost / content.convertingVideos : 0;
  const avgSampleCost = content.convertingVideos > 0 ? content.tiktokCreativeCost / content.convertingVideos : 0;

  const rows = [
    { metric: 'Meta ROAS', current: formatROAS(currentROAS), after: formatROAS(meta.newMetaROAS), change: '+20%', direction: 'up' },
    { metric: 'Meta Revenue', current: formatCurrency(meta.currentMetaRevenue), after: formatCurrency(meta.newMetaRevenue), change: `+${formatCurrency(meta.incrementalMetaRev)}`, direction: 'up' },
    { metric: 'Meta CAC', current: formatCAC(currentCAC), after: formatCAC(meta.newMetaCAC), change: '-11%', direction: 'down' },
    { metric: 'Meta CTR', current: formatPct(currentCTR), after: formatPct(meta.newMetaCTR), change: '+58%', direction: 'up' },
    { metric: 'Winning Ad Rate', current: 'Baseline', after: '2\u00D7', change: '+100%', direction: 'up' },
    { metric: 'Cost Per Creative', current: formatCurrency(costPerCreative), after: formatCurrency(avgSampleCost), change: `-${Math.round(content.costReductionPct * 100)}%`, direction: 'down' },
    { metric: 'Converting Videos/mo', current: '\u2014', after: formatNumber(content.convertingVideos), change: 'Pre-validated', direction: 'neutral' },
  ];

  const thStyle = {
    padding: '10px 14px',
    textAlign: 'left',
    fontSize: 10,
    fontWeight: 700,
    color: TEXT_BODY,
    textTransform: 'uppercase',
    letterSpacing: '3px',
    borderBottom: `1px solid ${BORDER_SUBTLE}`,
    fontFamily: FONT,
  };

  const tdBase = {
    padding: '12px 14px',
    fontSize: 13,
    fontWeight: 500,
    color: TEXT_HEADING,
    fontFamily: FONT,
    borderBottom: `1px solid ${BORDER_SUBTLE}`,
  };

  return (
    <AnimatedSection delay={200} dataSection="meta-comparison">
      <div
        style={{
          backgroundColor: BG_CARD,
          borderRadius: 16,
          padding: 26,
          border: `1px solid ${BORDER_SUBTLE}`,
          marginBottom: 20,
          fontFamily: FONT,
          overflowX: 'hidden',
        }}
      >
        <SectionTitle icon={BarChart3} number={2}>META PERFORMANCE — BEFORE VS. AFTER</SectionTitle>

        <NarrativeBlock>
          By using TikTok creator content as Meta Partnership Ads, your Meta ROAS improves from{' '}
          <strong style={{ color: TEXT_HEADING }}>{formatROAS(currentROAS)}</strong> to{' '}
          <strong style={{ color: INDIGO }}>{formatROAS(meta.newMetaROAS)}</strong>, generating an
          additional <strong style={{ color: INDIGO }}>{formatCurrency(meta.incrementalMetaRev)}/mo</strong> in
          revenue. Your CAC drops from <strong style={{ color: TEXT_HEADING }}>{formatCAC(currentCAC)}</strong> to{' '}
          <strong style={{ color: INDIGO }}>{formatCAC(meta.newMetaCAC)}</strong>, saving{' '}
          <strong style={{ color: INDIGO }}>{formatCurrency(meta.totalCPASavings)}/mo</strong> in acquisition costs.
        </NarrativeBlock>

        {/* Desktop: Table */}
        <div className="rv-meta-table">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Metric</th>
                <th style={thStyle}>Current</th>
                <th style={{ ...thStyle, backgroundColor: 'rgba(79,70,229,0.04)', color: INDIGO }}>With TikTok Content</th>
                <th style={thStyle}>Change</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const rowBg = i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.02)';
                let ChangeArrow = null;
                if (row.direction === 'up') ChangeArrow = ArrowUpRight;
                else if (row.direction === 'down') ChangeArrow = ArrowDownRight;

                return (
                  <tr key={i} style={{ backgroundColor: rowBg }}>
                    <td style={{ ...tdBase, fontWeight: 600 }}>{row.metric}</td>
                    <td style={{ ...tdBase, color: TEXT_BODY }}>{row.current}</td>
                    <td style={{ ...tdBase, fontWeight: 700, backgroundColor: 'rgba(79,70,229,0.04)' }}>{row.after}</td>
                    <td style={tdBase}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: INDIGO, fontWeight: 700, fontSize: 12 }}>
                        {ChangeArrow && <ChangeArrow size={13} />}
                        {row.change}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile: Stacked Cards */}
        <div className="rv-meta-cards">
          {rows.map((row, i) => {
            let ChangeArrow = null;
            if (row.direction === 'up') ChangeArrow = ArrowUpRight;
            else if (row.direction === 'down') ChangeArrow = ArrowDownRight;

            return (
              <div
                key={i}
                style={{
                  backgroundColor: 'rgba(0,0,0,0.02)',
                  borderRadius: 12,
                  padding: '14px 16px',
                  border: `1px solid ${BORDER_SUBTLE}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: TEXT_HEADING, fontFamily: FONT }}>{row.metric}</span>
                  <span
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 3,
                      fontSize: 12, fontWeight: 700, color: INDIGO,
                      backgroundColor: 'rgba(79,70,229,0.08)',
                      padding: '3px 8px', borderRadius: 6, fontFamily: FONT,
                    }}
                  >
                    {ChangeArrow && <ChangeArrow size={12} />}
                    {row.change}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: TEXT_BODY, textTransform: 'uppercase', letterSpacing: '3px', display: 'block', marginBottom: 4, fontFamily: FONT }}>Current</span>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#64748B', fontFamily: FONT }}>{row.current}</span>
                  </div>
                  <span style={{ fontSize: 20, color: TEXT_BODY, fontWeight: 300, flexShrink: 0 }}>{'\u2192'}</span>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: INDIGO, textTransform: 'uppercase', letterSpacing: '3px', display: 'block', marginBottom: 4, fontFamily: FONT }}>After</span>
                    <span style={{ fontSize: 18, fontWeight: 900, color: INDIGO, fontFamily: FONT }}>{row.after}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <SourceBadge text="Data from Meta Performance Marketing Summit 2025" />

        <PlainEnglish>
          Your Meta ads will perform 20% better because TikTok creator content outperforms traditional ads.
        </PlainEnglish>
      </div>
    </AnimatedSection>
  );
}


/* ══════════════════════════════════════════════════════════════════ */
/*  SECTION D — Content Engine (03)                                 */
/* ══════════════════════════════════════════════════════════════════ */
function ContentEngine({ results }) {
  const { content } = results;

  const costPerCreative = content.convertingVideos > 0 ? content.traditionalCost / content.convertingVideos : 0;
  const avgSampleCost = content.convertingVideos > 0 ? content.tiktokCreativeCost / content.convertingVideos : 0;

  const metrics = [
    { label: 'TOTAL AFFILIATE VIDEOS / MONTH', value: formatNumber(content.totalAffiliateVideos), highlight: false },
    { label: 'PROVEN CONVERTING VIDEOS', value: formatNumber(content.convertingVideos), highlight: true },
    { label: 'YOUR CURRENT COST PER ASSET', value: formatCurrency(costPerCreative), highlight: false },
    { label: 'TIKTOK COST PER ASSET (SAMPLE)', value: formatCurrency(avgSampleCost), highlight: true },
    { label: 'COST PER ASSET REDUCTION', value: `${Math.round(content.costReductionPct * 100)}%`, highlight: true },
    { label: 'MONTHLY CONTENT SAVINGS', value: formatCurrency(content.contentCostSavings), highlight: true },
  ];

  return (
    <AnimatedSection delay={300} dataSection="content-engine">
      <div
        style={{
          backgroundColor: BG_CARD,
          borderRadius: 16,
          padding: 26,
          border: `1px solid ${BORDER_SUBTLE}`,
          marginBottom: 20,
          fontFamily: FONT,
        }}
      >
        <SectionTitle icon={Video} number={3}>CONTENT ENGINE</SectionTitle>

        <NarrativeBlock>
          Your TikTok Shop affiliate program generates{' '}
          <strong style={{ color: TEXT_HEADING }}>{formatNumber(content.totalAffiliateVideos)}</strong> videos every
          month for the cost of product samples. Of those,{' '}
          <strong style={{ color: INDIGO }}>{formatNumber(content.convertingVideos)}</strong> are proven
          converters already validated by real purchases on TikTok. These are ready-made Meta creative at{' '}
          <strong style={{ color: INDIGO }}>{formatCurrency(avgSampleCost)}</strong> per asset vs. the{' '}
          <strong style={{ color: TEXT_HEADING }}>{formatCurrency(costPerCreative)}</strong> you currently pay.
          That is a <strong style={{ color: INDIGO }}>{Math.round(content.costReductionPct * 100)}%</strong> reduction
          in creative costs and{' '}
          <strong style={{ color: INDIGO }}>{formatCurrency(content.contentCostSavings)}/mo</strong> in savings.
        </NarrativeBlock>

        <div className="rv-content-grid">
          {metrics.map((m, i) => (
            <div
              key={i}
              style={{
                backgroundColor: m.highlight ? 'rgba(79,70,229,0.05)' : 'rgba(0,0,0,0.02)',
                borderRadius: 12,
                padding: '16px 18px',
                border: m.highlight ? '1px solid rgba(79,70,229,0.12)' : `1px solid ${BORDER_SUBTLE}`,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: m.highlight ? INDIGO : TEXT_BODY,
                  display: 'block',
                  marginBottom: 5,
                  textTransform: 'uppercase',
                  letterSpacing: '3px',
                  fontFamily: FONT,
                }}
              >
                {m.label}
              </span>
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: m.highlight ? INDIGO : TEXT_HEADING,
                  fontFamily: FONT,
                }}
              >
                {m.value}
              </span>
            </div>
          ))}
        </div>

        <SourceBadge text="Powered by ZEROT01 operational data" />

        <PlainEnglish>
          Instead of paying {formatCurrency(costPerCreative)}/video for ad creative, your TikTok
          affiliates produce proven content for just {formatCurrency(avgSampleCost)}/sample.
        </PlainEnglish>
      </div>
    </AnimatedSection>
  );
}


/* ══════════════════════════════════════════════════════════════════ */
/*  SECTION E — Annual Projection                                   */
/* ══════════════════════════════════════════════════════════════════ */
function AnnualProjection({ results }) {
  return (
    <AnimatedSection delay={400} dataSection="annual-projection">
      <div
        className="rv-annual-inner"
        style={{
          background: BG_CARD,
          borderRadius: 16,
          padding: '44px 32px',
          border: `2px solid ${INDIGO}`,
          textAlign: 'center',
          fontFamily: FONT,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(79,70,229,0.08)',
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: INDIGO,
            margin: 0,
            marginBottom: 12,
            fontFamily: FONT,
            textTransform: 'uppercase',
            letterSpacing: '3px',
          }}
        >
          ANNUAL PROJECTION {'\u25CF'}
        </p>

        <p
          style={{
            fontFamily: FONT,
            fontSize: 'clamp(40px, 6vw, 52px)',
            fontWeight: 900,
            color: INDIGO,
            margin: 0,
            lineHeight: 1,
            letterSpacing: '-2px',
          }}
        >
          {formatCurrency(results.combined.totalAnnualOpportunity)}
        </p>

        <p
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: TEXT_BODY,
            margin: 0,
            marginTop: 12,
          }}
        >
          /year on the table.
        </p>
      </div>
    </AnimatedSection>
  );
}


/* ══════════════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT — ResultsVisualizer                              */
/* ══════════════════════════════════════════════════════════════════ */
export default function ResultsVisualizer({ results }) {
  if (!results) return null;

  return (
    <div className="rv-results-root" style={{ fontFamily: FONT, color: TEXT_HEADING, background: BG_BASE }}>
      <style>{GLOBAL_STYLES}</style>

      <h2
        style={{
          fontFamily: FONT,
          fontSize: 24,
          fontWeight: 800,
          color: TEXT_HEADING,
          marginBottom: 6,
          textTransform: 'uppercase',
          letterSpacing: '-0.02em',
        }}
      >
        YOUR REVENUE OPPORTUNITY
      </h2>
      <p
        style={{
          fontSize: 14,
          color: TEXT_BODY,
          marginBottom: 24,
          fontFamily: FONT,
          lineHeight: 1.5,
        }}
      >
        Based on your inputs, here is what you are leaving on the table.
      </p>

      <ExecutiveSummary results={results} />
      <HeadlineStats results={results} />

      {/* Separator */}
      <div
        style={{
          height: 1,
          background: `linear-gradient(to right, transparent, ${BORDER_SUBTLE}, transparent)`,
          marginBottom: 24,
        }}
      />

      <HaloBreakdown results={results} />
      <MetaComparison results={results} />
      <ContentEngine results={results} />
      <AnnualProjection results={results} />

      {/* ── 6-Month Revenue Ramp ─────────────────────────────── */}
      <div
        style={{
          height: 1,
          background: `linear-gradient(to right, transparent, ${BORDER_SUBTLE}, transparent)`,
          margin: '24px 0',
        }}
      />
      <RevenueRampChart results={results} />
    </div>
  );
}
