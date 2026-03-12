/**
 * ZeroTo1 x Refunnel — Hidden Profits Calculator
 * Benchmark multipliers & default input values.
 * All hardcoded values live here — update this file to change calculations.
 */
export const BENCHMARKS = {
  halo: {
    amazonHalo: 0.62,        // 62% — Fospha Halo Report
    dtcHalo: 0.25,           // 25% — Fospha Halo Report
    newCustomerShare: 0.50,  // 50% of TikTok conversions are new customers
    profitableHeadroom: 0.63,
    shopHeadroom: 0.71,
    lastClickCapture: 0.019, // Last-click sees only 1.9% of true TikTok impact
  },
  metaPartnerAds: {
    roasLift: 0.20,          // +20% ROAS lift — Meta Performance Marketing Summit 2025
    ctrLiftLow: 0.58,        // +58% CTR (conservative)
    ctrLiftHigh: 0.80,       // +80% CTR (high end)
    cpaReduction: 0.11,      // -11% CPA
    winningAdsMultiplier: 2, // 2x winning ad rate
  },
  contentEngine: {
    gmvPerVideo: 30,            // $30 GMV per affiliate video — ZeroTo1 operational data
    affiliateShareOfGMV: 0.70,  // 70% of GMV from affiliates
    videoConversionRate: 0.075, // 7.5% of videos become proven converters
  },
  defaults: {
    tiktokGMV: 100000,
    tiktokAdSpend: 35000,
    tiktokROI: 2,
    avgSampleCost: 15,
    affiliateShare: 70,      // 70% — stored as percentage integer
    metaAdSpend: 350000,
    metaROAS: 1.5,
    metaCPM: 7.50,
    metaCTR: 1.5,            // stored as percentage (1.5 = 1.5%)
    metaCAC: 25,
    costPerCreative: 750,
    metaSpendMultiplier: 10, // Meta spend defaults to 10x TikTok ad spend
  },
};
