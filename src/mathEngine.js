/**
 * ZeroTo1 x Refunnel — Hidden Profits Calculator
 * Core math engine: calculateAll(inputs) returns results for all 4 modules.
 *
 * IMPORTANT: Every numeric constant comes from BENCHMARKS — no magic numbers.
 *
 * Verified against default inputs:
 *   Module 1: Amazon $62,000 | DTC $25,000 | Total Halo $87,000 | New Customers 1,740 | Annual $1,044,000
 *   Module 2: Current Rev $525,000 | New ROAS 1.80 | New Rev $630,000 | Incremental $105,000
 *            CPA savings/acq $2.75 | Acquisitions 14,000 | Total CPA Savings $38,500
 *            New CAC $22.25 | New CTR 2.37% | Annual $1,260,000
 *   Module 3: Affiliate GMV $70,000 | Videos 2,333 | Converting 175 | Trad Cost $131,250
 *            TikTok Cost $2,625 | Savings $128,625 | Reduction 98% | Annual $1,543,500
 *   Module 4: Monthly $359,125 | Annual $4,309,500
 */

import { BENCHMARKS } from './benchmarks.js';

// ---------------------------------------------------------------------------
// Formatting Utilities
// ---------------------------------------------------------------------------

/**
 * Format a number as currency: "$X,XXX" for values >= $1,000, "$X.XX" for < $1,000.
 * @param {number} value - The dollar amount to format.
 * @returns {string} Formatted currency string.
 */
export function formatCurrency(value) {
  // For values >= 1000, show whole-dollar with comma grouping
  if (Math.abs(value) >= 1000) {
    return '$' + Math.round(value).toLocaleString('en-US');
  }
  // For smaller values, show two decimal places
  return '$' + value.toFixed(2);
}

/**
 * Format a ROAS multiplier: "1.50x".
 * @param {number} value - The ROAS value.
 * @returns {string} Formatted ROAS string.
 */
export function formatROAS(value) {
  return value.toFixed(2) + 'x';
}

/**
 * Format a percentage value that is ALREADY expressed as a percentage.
 * E.g., 1.5 -> "1.50%", not 150%.
 * @param {number} value - The percentage value (1.5 means 1.5%).
 * @returns {string} Formatted percentage string.
 */
export function formatPct(value) {
  return value.toFixed(2) + '%';
}

/**
 * Format a CAC (cost per acquisition) as "$25.00".
 * @param {number} value - The CAC dollar amount.
 * @returns {string} Formatted CAC string.
 */
export function formatCAC(value) {
  return '$' + value.toFixed(2);
}

/**
 * Format a plain number with comma grouping: "1,740".
 * @param {number} value - The number to format.
 * @returns {string} Formatted number string.
 */
export function formatNumber(value) {
  return Math.round(value).toLocaleString('en-US');
}

/**
 * Format a dollar value in compact notation: "$100K", "$1.5M".
 * Rules:
 *   >= 1,000,000 -> "$XM" or "$X.XM"
 *   >= 1,000     -> "$XK" or "$X.XK"
 *   < 1,000      -> plain "$X"
 * @param {number} value - The dollar amount.
 * @returns {string} Compact formatted string.
 */
export function formatCompact(value) {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (abs >= 1_000_000) {
    // Divide by 1M; if it's a whole number of millions, skip the decimal
    const millions = abs / 1_000_000;
    const formatted = millions % 1 === 0
      ? millions.toFixed(0)
      : millions.toFixed(1);
    return sign + '$' + formatted + 'M';
  }

  if (abs >= 1_000) {
    // Divide by 1K; if it's a whole number of thousands, skip the decimal
    const thousands = abs / 1_000;
    const formatted = thousands % 1 === 0
      ? thousands.toFixed(0)
      : thousands.toFixed(1);
    return sign + '$' + formatted + 'K';
  }

  // Small value — just show the dollar amount
  return sign + '$' + Math.round(abs);
}

// ---------------------------------------------------------------------------
// Main Calculation Engine
// ---------------------------------------------------------------------------

/**
 * Run all four calculator modules and return structured results + warnings.
 *
 * @param {Object} inputs - User-provided (or default) input values.
 * @param {number} inputs.tiktokGMV        - Monthly TikTok Shop GMV ($).
 * @param {number} inputs.tiktokAdSpend    - Monthly TikTok ad spend ($).
 * @param {number} inputs.tiktokROI        - TikTok ad ROAS multiplier.
 * @param {number} inputs.avgSampleCost    - Average product sample cost ($).
 * @param {number} inputs.metaAdSpend      - Monthly Meta ad spend ($).
 * @param {number} inputs.metaROAS         - Current Meta ROAS multiplier.
 * @param {number} inputs.metaCPM          - Current Meta CPM ($).
 * @param {number} inputs.metaCTR          - Current Meta CTR (percentage, e.g. 1.5 = 1.5%).
 * @param {number} inputs.metaCAC          - Current Meta CAC ($).
 * @param {number} inputs.costPerCreative  - Cost to produce one creative traditionally ($).
 *
 * @returns {Object} { halo, meta, content, combined, warnings }
 */
export function calculateAll(inputs) {
  const {
    tiktokGMV,
    tiktokAdSpend,
    tiktokROI,
    avgSampleCost,
    affiliateShare,
    metaAdSpend,
    metaROAS,
    metaCPM,
    metaCTR,
    metaCAC,
    costPerCreative: rawCostPerCreative,
  } = inputs;

  // -------------------------------------------------------------------------
  // Validation warnings
  // -------------------------------------------------------------------------
  const warnings = [];

  // Sanity check: ad-driven revenue should not exceed total GMV
  // Ad-driven revenue = tiktokAdSpend x tiktokROI
  if (tiktokAdSpend * tiktokROI > tiktokGMV) {
    warnings.push(
      'Your ad-driven revenue exceeds total GMV. Please review your inputs.'
    );
  }

  // Check each required input for zero or negative values
  const requiredFields = {
    tiktokGMV,
    tiktokAdSpend,
    tiktokROI,
    avgSampleCost,
    metaAdSpend,
    metaROAS,
    metaCPM,
    metaCTR,
    metaCAC,
    rawCostPerCreative,
  };

  // Friendly labels for warning messages
  const fieldLabels = {
    tiktokGMV: 'TikTok GMV',
    tiktokAdSpend: 'TikTok Ad Spend',
    tiktokROI: 'TikTok ROI',
    avgSampleCost: 'Avg Sample Cost',
    metaAdSpend: 'Meta Ad Spend',
    metaROAS: 'Meta ROAS',
    metaCPM: 'Meta CPM',
    metaCTR: 'Meta CTR',
    metaCAC: 'Meta CAC',
    rawCostPerCreative: 'Cost Per Creative',
  };

  for (const [key, value] of Object.entries(requiredFields)) {
    if (value <= 0) {
      warnings.push(
        `${fieldLabels[key]} is ${value <= 0 ? 'zero or negative' : 'missing'}. Please enter a positive value.`
      );
    }
  }

  // If costPerCreative is 0, fall back to default ($750) for calculations
  const costPerCreative =
    rawCostPerCreative === 0
      ? BENCHMARKS.defaults.costPerCreative   // fallback: $750
      : rawCostPerCreative;

  // -------------------------------------------------------------------------
  // Destructure all benchmark values (no magic numbers anywhere below)
  // -------------------------------------------------------------------------

  // Halo benchmarks
  const { amazonHalo, dtcHalo, newCustomerShare } = BENCHMARKS.halo;

  // Meta Partner Ads benchmarks
  const { roasLift, ctrLiftLow, cpaReduction } = BENCHMARKS.metaPartnerAds;

  // Content Engine benchmarks
  const { gmvPerVideo, videoConversionRate } =
    BENCHMARKS.contentEngine;

  // -------------------------------------------------------------------------
  // MODULE 1 — TikTok Halo Effect
  // -------------------------------------------------------------------------
  // Every dollar of TikTok Shop GMV drives additional revenue on Amazon & DTC
  // that last-click attribution never sees.

  // Hidden Amazon revenue: tiktokGMV x 0.62  (Fospha Halo Report)
  const hiddenAmazonRevenue = tiktokGMV * amazonHalo;
  // e.g., $100,000 x 0.62 = $62,000

  // Hidden DTC revenue: tiktokGMV x 0.25  (Fospha Halo Report)
  const hiddenDTCRevenue = tiktokGMV * dtcHalo;
  // e.g., $100,000 x 0.25 = $25,000

  // Total halo revenue (Amazon + DTC combined)
  const totalHaloRevenue = hiddenAmazonRevenue + hiddenDTCRevenue;
  // e.g., $62,000 + $25,000 = $87,000

  // New customers missed by attribution:
  // (totalHaloRevenue / metaCAC) x newCustomerShare
  // This estimates how many net-new customers this halo revenue represents.
  const newCustomersMissed = (totalHaloRevenue / metaCAC) * newCustomerShare;
  // e.g., ($87,000 / $25) x 0.50 = 1,740

  // Annualized halo revenue
  const annualHaloRevenue = totalHaloRevenue * 12;
  // e.g., $87,000 x 12 = $1,044,000

  const halo = {
    hiddenAmazonRevenue,   // $62,000
    hiddenDTCRevenue,      // $25,000
    totalHaloRevenue,      // $87,000
    newCustomersMissed,    // 1,740
    annualHaloRevenue,     // $1,044,000
  };

  // -------------------------------------------------------------------------
  // MODULE 2 — Meta Performance Lift (Partner Ads / Creative Repurposing)
  // -------------------------------------------------------------------------
  // Repurposing TikTok-proven creative on Meta lifts ROAS, CTR, and lowers CPA.

  // Current monthly Meta revenue: metaAdSpend x metaROAS
  const currentMetaRevenue = metaAdSpend * metaROAS;
  // e.g., $350,000 x 1.5 = $525,000

  // New ROAS after applying the +20% lift benchmark
  const newMetaROAS = metaROAS * (1 + roasLift);
  // e.g., 1.5 x 1.20 = 1.80

  // New monthly Meta revenue at the lifted ROAS
  const newMetaRevenue = metaAdSpend * newMetaROAS;
  // e.g., $350,000 x 1.80 = $630,000

  // Incremental revenue gained from the ROAS lift
  const incrementalMetaRev = newMetaRevenue - currentMetaRevenue;
  // e.g., $630,000 - $525,000 = $105,000

  // Per-acquisition CPA savings: metaCAC x cpaReduction (11%)
  const cpaSavingsPerAcq = metaCAC * cpaReduction;
  // e.g., $25 x 0.11 = $2.75

  // Total customer acquisitions this month at current CAC
  const totalAcquisitions = metaAdSpend / metaCAC;
  // e.g., $350,000 / $25 = 14,000

  // Total CPA savings across all acquisitions
  const totalCPASavings = totalAcquisitions * cpaSavingsPerAcq;
  // e.g., 14,000 x $2.75 = $38,500

  // New CTR after applying the +58% lift (conservative estimate)
  // metaCTR is stored as a percentage (1.5 = 1.5%), so we multiply in-place
  const newMetaCTR = metaCTR * (1 + ctrLiftLow);
  // e.g., 1.5 x 1.58 = 2.37 (meaning 2.37%)

  // New CAC after the 11% reduction
  const newMetaCAC = metaCAC * (1 - cpaReduction);
  // e.g., $25 x 0.89 = $22.25

  // Annualized incremental Meta revenue
  const annualIncrementalMeta = incrementalMetaRev * 12;
  // e.g., $105,000 x 12 = $1,260,000

  const meta = {
    currentMetaRevenue,    // $525,000
    newMetaROAS,           // 1.80
    newMetaRevenue,        // $630,000
    incrementalMetaRev,    // $105,000
    cpaSavingsPerAcq,      // $2.75
    totalAcquisitions,     // 14,000
    totalCPASavings,       // $38,500
    newMetaCTR,            // 2.37 (percentage)
    newMetaCAC,            // $22.25
    annualIncrementalMeta, // $1,260,000
  };

  // -------------------------------------------------------------------------
  // MODULE 3 — Content Engine (Affiliate-Driven Creative)
  // -------------------------------------------------------------------------
  // TikTok affiliates produce converting video content at a fraction of
  // traditional creative costs.

  // Affiliate GMV: user-specified percentage of total TikTok GMV from affiliates
  // affiliateShare comes as percentage integer (70 = 70%)
  const affiliateShareDecimal = (affiliateShare || 70) / 100;
  const affiliateGMV = tiktokGMV * affiliateShareDecimal;
  // e.g., $100,000 x 0.70 = $70,000

  // Total affiliate videos: affiliateGMV / gmvPerVideo
  // Each affiliate video drives ~$30 of GMV on average.
  const totalAffiliateVideos = affiliateGMV / gmvPerVideo;
  // e.g., $70,000 / $30 = 2,333.33...

  // Converting videos: only 7.5% become proven converters worth repurposing
  const convertingVideos = totalAffiliateVideos * videoConversionRate;
  // e.g., 2,333.33 x 0.075 = 175

  // Traditional cost to produce that many creatives at agency/production rates
  const traditionalCost = convertingVideos * costPerCreative;
  // e.g., 175 x $750 = $131,250

  // TikTok creative cost: only the sample cost per converting video
  const tiktokCreativeCost = convertingVideos * avgSampleCost;
  // e.g., 175 x $15 = $2,625

  // Net content cost savings
  const contentCostSavings = traditionalCost - tiktokCreativeCost;
  // e.g., $131,250 - $2,625 = $128,625

  // Cost reduction percentage: 1 - (sampleCost / creativeProductionCost)
  const costReductionPct = 1 - (avgSampleCost / costPerCreative);
  // e.g., 1 - ($15 / $750) = 1 - 0.02 = 0.98 (98%)

  // Annualized content savings
  const annualContentSavings = contentCostSavings * 12;
  // e.g., $128,625 x 12 = $1,543,500

  const content = {
    affiliateGMV,          // $70,000
    totalAffiliateVideos,  // 2,333.33
    convertingVideos,      // 175
    traditionalCost,       // $131,250
    tiktokCreativeCost,    // $2,625
    contentCostSavings,    // $128,625
    costReductionPct,      // 0.98 (98%)
    annualContentSavings,  // $1,543,500
  };

  // -------------------------------------------------------------------------
  // MODULE 4 — Combined Opportunity
  // -------------------------------------------------------------------------
  // Sum of all three value streams: halo + incremental Meta + CPA savings + content savings.

  // Monthly total opportunity
  const totalMonthlyOpportunity =
    totalHaloRevenue +       // $87,000   (Module 1)
    incrementalMetaRev +     // $105,000  (Module 2 — ROAS lift)
    totalCPASavings +        // $38,500   (Module 2 — CPA savings)
    contentCostSavings;      // $128,625  (Module 3)
  // e.g., $87,000 + $105,000 + $38,500 + $128,625 = $359,125

  // Annual total opportunity
  const totalAnnualOpportunity = totalMonthlyOpportunity * 12;
  // e.g., $359,125 x 12 = $4,309,500

  const combined = {
    totalMonthlyOpportunity,  // $359,125
    totalAnnualOpportunity,   // $4,309,500
    tiktokGMV: inputs.tiktokGMV,
  };

  // -------------------------------------------------------------------------
  // Return all results
  // -------------------------------------------------------------------------
  return {
    halo,
    meta,
    content,
    combined,
    warnings,
  };
}
