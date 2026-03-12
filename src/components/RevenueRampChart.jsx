/**
 * RevenueRampChart.jsx
 * ZeroTo1 × Refunnel — 6-Month Revenue Growth Trajectory
 *
 * Stacked bar chart showing TikTok GMV + Amazon Halo + Meta Lift
 * ramping over 6 months using tier-based MoM growth rates.
 * No external chart library — pure React + inline styles.
 */

import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { formatCurrency, formatCompact } from '../mathEngine.js';
import {
  FONT, INDIGO, INDIGO_LIGHT,
  BG_CARD, TEXT_HEADING, TEXT_BODY, BORDER_SUBTLE,
} from '../tokens.js';

const TIKTOK_COLOR = '#94A3B8';
const AMAZON_COLOR = INDIGO;
const META_COLOR   = INDIGO_LIGHT;

const CHART_HEIGHT = 240; // px, desktop

/* ── Growth Rate Tiers ─────────────────────────────────────────── */
function getGrowthTier(gmv) {
  if (gmv <= 65000)  return { rate: 0.50, label: 'Cold Start', pct: '50%' };
  if (gmv <= 500000) return { rate: 0.20, label: 'Sophomore',  pct: '20%' };
  return                      { rate: 0.10, label: 'Senior',     pct: '10%' };
}

/* ── Build 6-month data (backward from Month 6) ────────────────── */
function buildMonthData(results) {
  const gmv = results.combined.tiktokGMV;
  const { rate } = getGrowthTier(gmv);

  // Month 6 = full calculator values; floor TikTok GMV at $10K
  const m6 = {
    tiktok: Math.max(gmv, 10000),
    amazon: results.halo.hiddenAmazonRevenue,
    meta:   results.meta.incrementalMetaRev + results.meta.totalCPASavings,
  };

  const data = new Array(6);
  data[5] = { ...m6 };

  const divisor = 1 + rate;
  for (let i = 4; i >= 0; i--) {
    data[i] = {
      tiktok: data[i + 1].tiktok / divisor,
      amazon: data[i + 1].amazon / divisor,
      meta:   data[i + 1].meta   / divisor,
    };
  }

  return data;
}

/* ── Tooltip ───────────────────────────────────────────────────── */
function Tooltip({ data, monthIndex, left }) {
  if (monthIndex === null || !data[monthIndex]) return null;
  const m = data[monthIndex];
  const total = m.tiktok + m.amazon + m.meta;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 'calc(100% + 8px)',
        left: left,
        transform: 'translateX(-50%)',
        background: BG_CARD,
        border: `1px solid ${INDIGO}`,
        borderRadius: 10,
        padding: '10px 14px',
        minWidth: 180,
        zIndex: 10,
        pointerEvents: 'none',
        fontFamily: FONT,
        boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
      }}
    >
      <p style={{ fontSize: 11, fontWeight: 700, color: INDIGO, textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 8px', fontFamily: FONT }}>
        Month {monthIndex + 1}
      </p>
      {[
        { label: 'TikTok GMV',   value: m.tiktok, color: TIKTOK_COLOR },
        { label: 'Amazon Halo',  value: m.amazon, color: AMAZON_COLOR },
        { label: 'Meta Lift',    value: m.meta,   color: META_COLOR   },
      ].map(({ label, value, color }) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: TEXT_BODY }}>{label}</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: TEXT_HEADING, marginLeft: 12 }}>{formatCurrency(value)}</span>
        </div>
      ))}
      <div style={{ borderTop: `1px solid ${BORDER_SUBTLE}`, marginTop: 6, paddingTop: 6, display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: TEXT_HEADING }}>Total</span>
        <span style={{ fontSize: 12, fontWeight: 900, color: INDIGO, fontFamily: FONT }}>{formatCurrency(total)}</span>
      </div>
    </div>
  );
}

/* ── Main Component ────────────────────────────────────────────── */
export default function RevenueRampChart({ results }) {
  const [hoveredMonth, setHoveredMonth] = useState(null);
  const [tooltipLeft, setTooltipLeft] = useState('50%');

  if (!results) return null;

  const gmv  = results.combined.tiktokGMV;
  const tier = getGrowthTier(gmv);
  const data = buildMonthData(results);

  const totals = data.map(m => m.tiktok + m.amazon + m.meta);
  const maxTotal = Math.max(...totals);

  const m6Total = totals[5];

  return (
    <div
      data-section="revenue-ramp"
      style={{
        backgroundColor: BG_CARD,
        borderRadius: 16,
        padding: 26,
        border: `1px solid ${BORDER_SUBTLE}`,
        marginBottom: 20,
        fontFamily: FONT,
      }}
    >
      {/* ── Section Header ───────────────────────────────────────── */}
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
          marginBottom: 10,
          textTransform: 'uppercase',
          letterSpacing: '-0.02em',
        }}
      >
        <TrendingUp size={20} color={INDIGO} />
        YOUR 6-MONTH GROWTH TRAJECTORY
      </h3>

      {/* ── Tier Badge ───────────────────────────────────────────── */}
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            borderRadius: 9999,
            backgroundColor: 'rgba(79,70,229,0.08)',
            border: '1px solid rgba(79,70,229,0.20)',
            fontSize: 11,
            fontWeight: 700,
            color: INDIGO,
            fontFamily: FONT,
            textTransform: 'uppercase',
            letterSpacing: '2px',
          }}
        >
          {tier.label} Tier · {tier.pct} MoM Growth
        </span>
        <span style={{ fontSize: 12, color: TEXT_BODY }}>
          Based on your current TikTok Shop GMV
        </span>
      </div>

      {/* ── Chart ────────────────────────────────────────────────── */}
      <div
        className="ramp-chart-area"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          gap: 10,
          height: CHART_HEIGHT + 'px',
          paddingBottom: 0,
        }}
      >
        {data.map((m, i) => {
          const total     = totals[i];
          const barH      = maxTotal > 0 ? (total / maxTotal) * CHART_HEIGHT : 0;
          const tiktokH   = total > 0 ? (m.tiktok / total) * barH : 0;
          const amazonH   = total > 0 ? (m.amazon / total) * barH : 0;
          const metaH     = total > 0 ? (m.meta   / total) * barH : 0;
          const isHovered = hoveredMonth === i;
          const isMonth6  = i === 5;

          return (
            <div
              key={i}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', position: 'relative' }}
              onMouseEnter={(e) => {
                setHoveredMonth(i);
                // Calculate tooltip left relative to chart container
                const colRect = e.currentTarget.getBoundingClientRect();
                const parentRect = e.currentTarget.parentElement.getBoundingClientRect();
                const center = colRect.left - parentRect.left + colRect.width / 2;
                setTooltipLeft(center + 'px');
              }}
              onMouseLeave={() => setHoveredMonth(null)}
            >
              {/* Bar stack */}
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'flex-end',
                }}
              >
                <div
                  className="ramp-chart-bar"
                  style={{
                    width: '100%',
                    height: barH + 'px',
                    display: 'flex',
                    flexDirection: 'column-reverse',
                    borderRadius: '4px 4px 0 0',
                    overflow: 'hidden',
                    transition: 'opacity 0.15s',
                    opacity: hoveredMonth !== null && !isHovered ? 0.45 : 1,
                    outline: isMonth6 ? `2px solid ${INDIGO}` : isHovered ? `1px solid rgba(0,0,0,0.15)` : 'none',
                    outlineOffset: isMonth6 ? 2 : 0,
                  }}
                >
                  {/* Bottom: TikTok GMV */}
                  <div style={{ height: tiktokH + 'px', backgroundColor: TIKTOK_COLOR, flexShrink: 0 }} />
                  {/* Middle: Amazon Halo */}
                  <div style={{ height: amazonH + 'px', backgroundColor: AMAZON_COLOR, flexShrink: 0 }} />
                  {/* Top: Meta Lift */}
                  <div style={{ height: metaH + 'px', backgroundColor: META_COLOR, flexShrink: 0 }} />
                </div>
              </div>

              {/* Month label */}
              <span
                style={{
                  position: 'absolute',
                  bottom: -(22),
                  fontSize: 11,
                  fontWeight: isMonth6 ? 800 : 600,
                  color: isMonth6 ? INDIGO : TEXT_BODY,
                  fontFamily: FONT,
                  whiteSpace: 'nowrap',
                }}
              >
                {isMonth6 ? 'Mo 6 ★' : `Mo ${i + 1}`}
              </span>

              {/* Total label above bar (only month 6 always visible, others on hover) */}
              {(isHovered || isMonth6) && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: barH + 6,
                    fontSize: 10,
                    fontWeight: 700,
                    color: isMonth6 ? INDIGO : TEXT_HEADING,
                    fontFamily: FONT,
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                  }}
                >
                  {formatCompact(total)}
                </span>
              )}
            </div>
          );
        })}

        {/* Tooltip (floats above hovered bar) */}
        {hoveredMonth !== null && (
          <Tooltip data={data} monthIndex={hoveredMonth} left={tooltipLeft} />
        )}
      </div>

      {/* X-axis spacer for month labels */}
      <div style={{ height: 28 }} />

      {/* ── Legend ───────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 20, marginTop: 4 }}>
        {[
          { label: 'TikTok GMV',  color: TIKTOK_COLOR },
          { label: 'Amazon Halo', color: AMAZON_COLOR },
          { label: 'Meta Lift',   color: META_COLOR   },
        ].map(({ label, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: TEXT_BODY, fontFamily: FONT }}>{label}</span>
          </div>
        ))}
        <span style={{ fontSize: 11, color: TEXT_BODY, marginLeft: 'auto', fontStyle: 'italic' }}>
          ★ Month 6 = full opportunity
        </span>
      </div>

      {/* ── Month 6 Callout ──────────────────────────────────────── */}
      <div
        style={{
          background: 'rgba(79,70,229,0.05)',
          border: '1px solid rgba(79,70,229,0.15)',
          borderRadius: 10,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <p style={{ fontSize: 14, color: '#334155', fontFamily: FONT, margin: 0, lineHeight: 1.5 }}>
          By Month 6, your full revenue opportunity reaches
        </p>
        <p style={{ fontSize: 22, fontWeight: 900, color: INDIGO, fontFamily: FONT, margin: 0, letterSpacing: '-0.5px' }}>
          {formatCurrency(m6Total)}<span style={{ fontSize: 13, fontWeight: 600, color: INDIGO_LIGHT, marginLeft: 4 }}>/month</span>
        </p>
      </div>
    </div>
  );
}
