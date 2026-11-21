import {
  DirectionBand,
  DecisionLogEntry,
  ExecutiveScenario,
  FinalEvaluation,
  GaugeKey,
  GaugeValues,
  GradeLetter,
  ScenarioDomain,
  SystemParameters,
} from '../types';
import {
  simulateAssetPrice,
  simulateMacroCycle,
  simulateMicrostructure,
} from './mathEngine';
import { SCENARIO_CHALLENGES } from '../data/challenges';

/**
 * Slider min/max ranges matching src/data/challenges.ts.
 * All option deltas are expressed as fractions of (max - min) so scales stay consistent.
 */
export const PARAMETER_RANGES: Record<keyof SystemParameters, [number, number]> = {
  liquidityDepth: [10, 100],
  hftSpeed: [1, 100],
  triggerSellSize: [100, 1000],
  marketMakersPresence: [5, 100],
  meanReversion: [0.05, 1.0],
  volatilityFeedback: [0.0, 2.0],
  hurstExponent: [0.1, 0.9],
  bubbleGrowthRate: [0.0, 0.1],
  leverageLimit: [1.0, 5.0],
  centralBankRate: [0.0, 15.0],
  shockMagnitude: [0.0, 100.0],
  recoveryRegenerationSpeed: [1.0, 10.0],
};

/**
 * Maximum per-stage parameter shift as a fraction of each parameter's range.
 * Ensures chaos amplifies differences fairly without instant T1 fatalities.
 */
const MAX_DELTA_FRACTION = 0.35;

export function applyOptionDeltas(
  currentParams: SystemParameters,
  deltas: Partial<Record<keyof SystemParameters, number>>
): SystemParameters {
  const next: SystemParameters = { ...currentParams };
  (Object.keys(deltas) as (keyof SystemParameters)[]).forEach((key) => {
    const rawFrac = deltas[key];
    if (rawFrac === undefined) return;
    const [min, max] = PARAMETER_RANGES[key];
    const cappedFrac = Math.max(-MAX_DELTA_FRACTION, Math.min(MAX_DELTA_FRACTION, rawFrac));
    const updated = next[key] + cappedFrac * (max - min);
    next[key] = Number(Math.max(min, Math.min(max, updated)).toFixed(4));
  });
  return next;
}

export function getLimitForPeriod(domain: ScenarioDomain, stageIndex: number): number {
  if (domain === 'microstructure') return (stageIndex + 1) * 40; // 40, 80, 120, 160, 200
  if (domain === 'assetPrice') return (stageIndex + 1) * 60; // 60, 120, 180, 240, 300
  return Math.min(41, (stageIndex + 1) * 8 + 1); // 9, 17, 25, 33, 41
}

export function runScenarioSolver(
  scenario: ExecutiveScenario,
  fiveStageParams: SystemParameters[]
): any[] {
  if (scenario.domain === 'microstructure') {
    return simulateMicrostructure(fiveStageParams, scenario.regime);
  }
  if (scenario.domain === 'assetPrice') {
    return simulateAssetPrice(fiveStageParams, scenario.regime);
  }
  return simulateMacroCycle(fiveStageParams, scenario.regime);
}

const clampPct = (val: number) => Math.max(0, Math.min(100, Math.round(val)));

/**
 * Computes the four 0-100% gauges strictly from the solver outputs and active stage parameters.
 *
 * EXACT FORMULAS DOCUMENTED PER DOMAIN:
 *
 * 1. MICROSTRUCTURE DOMAIN (ticks 0..endOfStage):
 *    - Liquidity         = 0.55 * (avgBidDepth / 95 * 100) + 0.25 * (liquidityDepth) + 0.20 * (100 - min(100, avgSpread * 25))
 *    - Market Confidence = 100 - max(0, 100 - endPrice) * 2.1 - min(28, maxSpread * 6) + (marketMakersPresence - 50) * 0.18 + (hftSpeed - 50) * 0.12
 *    - Systemic Stability = 100 - drawdownPct * 2.2 - max(0, avgHftRatio - 0.55) * 35
 *      where drawdownPct = ((peakPrice - minPrice) / peakPrice) * 100
 *    - Regulatory Standing = 0.45 * marketMakersPresence + 0.35 * (100 - hftSpeed) + 0.20 * (100 - (triggerSellSize - 100) / 9)
 *
 * 2. ASSET PRICE / SPECULATIVE BUBBLE DOMAIN (days 0..endOfStage):
 *    - Liquidity         = 94 - min(58, avgChVol * 1.9) - min(24, Math.abs(endPrice - endLinearPrice) * 0.14)
 *    - Market Confidence = 76 - max(0, 96 - minPrice) * 1.1 + min(18, Math.max(0, endPrice - 95) * 0.18) + (bubbleGrowthRate * 180) - (meanReversion * 14)
 *    - Systemic Stability = 100 - drawdownPct * 1.45 - min(30, maxChVol * 0.75) - Math.max(0, hurstExponent - 0.52) * 45
 *    - Regulatory Standing = 38 * meanReversion + 26 * (1 - volatilityFeedback / 2) + 22 * (1 - bubbleGrowthRate / 0.1) + 14 * (1 - Math.max(0, hurstExponent - 0.5) / 0.4)
 *
 * 3. MACROECONOMIC GDP CYCLE DOMAIN (quarters 0..endOfStage):
 *    - Liquidity         = 58 - (centralBankRate / 15) * 36 + clamp(-20, 34, (endGDP - 85) * 0.85) - Math.max(0, maxLeverage - 3.0) * 10
 *    - Market Confidence = clamp(0, 100, (endGDP - 52) * 1.15 + (recoveryRegenerationSpeed / 10) * 22 - (shockMagnitude / 100) * 14 - (centralBankRate / 15) * 14)
 *    - Systemic Stability = 100 - gdpDrawdownPct * 1.95 - Math.max(0, maxLeverage - 2.0) * 12
 *    - Regulatory Standing = 42 * (1 - (leverageLimit - 1.0) / 4.0) + 28 * (1 - shockMagnitude / 100) + 30 * (1 - Math.abs(centralBankRate - 3.0) / 12.0)
 *
 * FAIRNESS SMOOTHING:
 *   To prevent chaos from making a single T1 choice instantaneously fatal,
 *   stage-to-stage gauge swings are smoothed/capped to [-26, +26] and T1 floors at 28%.
 */
export function computeStageGauges(
  scenario: ExecutiveScenario,
  simData: any[],
  stageIndex: number,
  activeParams: SystemParameters,
  previousGauges?: GaugeValues
): GaugeValues {
  const limit = Math.min(simData.length, getLimitForPeriod(scenario.domain, stageIndex));
  const slice = simData.slice(0, Math.max(1, limit));

  const startIdx = stageIndex === 0 ? 0 : Math.min(limit - 1, getLimitForPeriod(scenario.domain, stageIndex - 1));
  const stageSlice = slice.slice(startIdx);

  let raw: GaugeValues;

  if (scenario.domain === 'microstructure') {
    const prices = slice.map((d) => d.price as number);
    const stagePrices = stageSlice.map((d) => d.price as number);
    const stageBids = stageSlice.map((d) => d.bidDepth as number);
    const stageSpreads = stageSlice.map((d) => d.spread as number);
    const stageHfts = stageSlice.map((d) => d.hftRatio as number);

    const peakPrice = Math.max(...prices);
    const minStagePrice = Math.min(...stagePrices);
    const endPrice = prices[prices.length - 1];
    const avgBid = stageBids.reduce((a, b) => a + b, 0) / stageBids.length;
    const avgSpread = stageSpreads.reduce((a, b) => a + b, 0) / stageSpreads.length;
    const maxSpread = Math.max(...stageSpreads);
    const avgHft = stageHfts.reduce((a, b) => a + b, 0) / stageHfts.length;
    const stageDrawdownPct = peakPrice > 0 ? ((peakPrice - minStagePrice) / peakPrice) * 100 : 0;

    const liquidity =
      0.48 * Math.min(100, (avgBid / 88) * 100) +
      0.32 * activeParams.liquidityDepth +
      0.20 * (100 - Math.min(100, avgSpread * 22));

    const confidence =
      98 -
      Math.max(0, 100 - endPrice) * 1.9 -
      Math.min(26, maxSpread * 5.5) +
      (activeParams.marketMakersPresence - 50) * 0.2 +
      (activeParams.hftSpeed - 50) * 0.1;

    const stability =
      100 -
      stageDrawdownPct * 1.85 -
      Math.max(0, avgHft - 0.52) * 38 -
      Math.max(0, 60 - activeParams.marketMakersPresence) * 0.25;

    const regulatory =
      0.45 * activeParams.marketMakersPresence +
      0.35 * (100 - activeParams.hftSpeed) +
      0.20 * (100 - (activeParams.triggerSellSize - 100) / 9);

    raw = {
      liquidity: clampPct(liquidity),
      confidence: clampPct(confidence),
      stability: clampPct(stability),
      regulatory: clampPct(regulatory),
    };
  } else if (scenario.domain === 'assetPrice') {
    const chPrices = slice.map((d) => d.chPrice as number);
    const stagePrices = stageSlice.map((d) => d.chPrice as number);
    const stageLinear = stageSlice.map((d) => d.linearPrice as number);
    const stageVols = stageSlice.map((d) => d.chVol as number);

    const endPrice = chPrices[chPrices.length - 1];
    const endLinear = stageLinear[stageLinear.length - 1];
    const avgVol = stageVols.reduce((a, b) => a + b, 0) / stageVols.length;
    const maxStageVol = Math.max(...stageVols);
    const stageMin = Math.min(...stagePrices);
    const stagePeak = Math.max(...stagePrices);
    const stageSwingPct = stagePeak > 0 ? ((stagePeak - stageMin) / stagePeak) * 100 : 0;

    // Normalized deviation from linear fundamental anchor (capped fairly for chaotic bubbles)
    const relDev = endLinear > 0 ? Math.abs(endPrice - endLinear) / endLinear : 0;
    const volScale = scenario.regime === 'chaotic' ? 0.85 : 2.1;

    const liquidity =
      94 -
      Math.min(48, avgVol * volScale) -
      Math.min(28, relDev * 28) -
      Math.max(0, activeParams.volatilityFeedback - 0.5) * 10;

    const confidence =
      78 -
      Math.max(0, 92 - endPrice) * 0.85 -
      Math.min(24, Math.max(0, stageSwingPct - 18) * 0.45) +
      activeParams.bubbleGrowthRate * 160 -
      activeParams.meanReversion * 12;

    const stability =
      100 -
      Math.min(42, stageSwingPct * (scenario.regime === 'chaotic' ? 0.55 : 1.35)) -
      Math.min(26, maxStageVol * (scenario.regime === 'chaotic' ? 0.45 : 1.4)) -
      Math.max(0, activeParams.hurstExponent - 0.52) * 55 -
      Math.max(0, activeParams.bubbleGrowthRate - 0.02) * 280;

    const regulatory =
      38 * activeParams.meanReversion +
      26 * (1 - activeParams.volatilityFeedback / 2) +
      22 * (1 - activeParams.bubbleGrowthRate / 0.1) +
      14 * (1 - Math.max(0, activeParams.hurstExponent - 0.5) / 0.4);

    raw = {
      liquidity: clampPct(liquidity),
      confidence: clampPct(confidence),
      stability: clampPct(stability),
      regulatory: clampPct(regulatory),
    };
  } else {
    const gdps = slice.map((d) => d.chGDP as number);
    const stageGdps = stageSlice.map((d) => d.chGDP as number);
    const levs = slice.map((d) => d.leverage as number);

    const endGDP = gdps[gdps.length - 1];
    const minStageGDP = Math.min(...stageGdps);
    const peakGDP = Math.max(...gdps);
    const endLev = levs[levs.length - 1];
    const stageDrawdownPct = peakGDP > 0 ? Math.max(0, ((peakGDP - minStageGDP) / peakGDP) * 100) : 0;

    const gdpBoost = Math.max(-24, Math.min(34, (endGDP - 85) * 0.9));
    const liquidity =
      60 -
      (activeParams.centralBankRate / 15) * 34 +
      gdpBoost -
      Math.max(0, endLev - 2.8) * 9;

    const confidence =
      (endGDP - 54) * 1.15 +
      (activeParams.recoveryRegenerationSpeed / 10) * 22 -
      (activeParams.shockMagnitude / 100) * 14 -
      (activeParams.centralBankRate / 15) * 14;

    const stability =
      100 -
      stageDrawdownPct * 1.65 -
      Math.max(0, endLev - 2.2) * 11 -
      Math.max(0, activeParams.leverageLimit - 2.4) * 9;

    const regulatory =
      42 * (1 - (activeParams.leverageLimit - 1.0) / 4.0) +
      28 * (1 - activeParams.shockMagnitude / 100) +
      30 * (1 - Math.abs(activeParams.centralBankRate - 3.0) / 12.0);

    raw = {
      liquidity: clampPct(liquidity),
      confidence: clampPct(confidence),
      stability: clampPct(stability),
      regulatory: clampPct(regulatory),
    };
  }

  // Fairness cap: limit per-stage gauge swing and protect T1 from instant fatality
  if (previousGauges) {
    const keys: GaugeKey[] = ['liquidity', 'confidence', 'stability', 'regulatory'];
    const smoothed: GaugeValues = { ...raw };
    for (const k of keys) {
      const diff = raw[k] - previousGauges[k];
      const cappedDiff = Math.max(-26, Math.min(26, diff));
      smoothed[k] = clampPct(previousGauges[k] + cappedDiff);
      if (stageIndex === 0) {
        smoothed[k] = Math.max(28, smoothed[k]);
      }
    }
    return smoothed;
  }

  return {
    liquidity: Math.max(28, raw.liquidity),
    confidence: Math.max(28, raw.confidence),
    stability: Math.max(28, raw.stability),
    regulatory: Math.max(28, raw.regulatory),
  };
}

export function getDirectionBand(delta: number): DirectionBand {
  if (delta >= 7) return 'up-a-lot';
  if (delta >= 2) return 'up';
  if (delta <= -7) return 'down-a-lot';
  if (delta <= -2) return 'down';
  return 'flat';
}

/**
 * Dry-run the solver for a hovered option without mutating any game state.
 * Returns ONLY qualitative direction bands (never exact numbers).
 */
export function previewOptionDirectionBands(
  scenario: ExecutiveScenario,
  fiveStageParams: SystemParameters[],
  stageIndex: number,
  optionDeltas: Partial<Record<keyof SystemParameters, number>>,
  currentGauges: GaugeValues
): Record<GaugeKey, DirectionBand> {
  const baseParams = fiveStageParams[stageIndex] || scenario.initialParameters;
  const dryParams = applyOptionDeltas(baseParams, optionDeltas);
  const dryList = fiveStageParams.map((p, idx) => (idx >= stageIndex ? dryParams : p));
  const drySim = runScenarioSolver(scenario, dryList);
  const dryGauges = computeStageGauges(scenario, drySim, stageIndex, dryParams, currentGauges);

  return {
    liquidity: getDirectionBand(dryGauges.liquidity - currentGauges.liquidity),
    confidence: getDirectionBand(dryGauges.confidence - currentGauges.confidence),
    stability: getDirectionBand(dryGauges.stability - currentGauges.stability),
    regulatory: getDirectionBand(dryGauges.regulatory - currentGauges.regulatory),
  };
}

export function getGradeFromScore(score: number, minGauge: number): GradeLetter {
  if (score >= 88 && minGauge >= 62) return 'A+';
  if (score >= 80 && minGauge >= 55) return 'A';
  if (score >= 74) return 'A-';
  if (score >= 68) return 'B+';
  if (score >= 62) return 'B';
  if (score >= 50) return 'C';
  if (score >= 38) return 'D';
  return 'F';
}

export function compareGrades(a: GradeLetter, b: GradeLetter): number {
  const order: GradeLetter[] = ['F', 'D', 'C', 'B', 'B+', 'A-', 'A', 'A+'];
  return order.indexOf(a) - order.indexOf(b);
}

export function evaluateFinalOutcome(
  scenario: ExecutiveScenario,
  simData: any[],
  fiveStageParams: SystemParameters[],
  finalGauges: GaugeValues,
  decisionLog: DecisionLogEntry[]
): FinalEvaluation {
  // Base composite score from the four gauges (weighted toward stability & liquidity)
  const gaugeScore =
    finalGauges.stability * 0.34 +
    finalGauges.liquidity * 0.26 +
    finalGauges.confidence * 0.22 +
    finalGauges.regulatory * 0.18;

  // Evaluate legacy challenge metrics if available
  const challenge = SCENARIO_CHALLENGES.find((c) => c.id === scenario.challengeId);
  const legacyEval = challenge
    ? challenge.evaluate({
        microstructure: simData,
        assetPrice: simData,
        macroCycle: simData,
      })
    : { success: false, reason: '', metrics: {} };

  const minGauge = Math.min(
    finalGauges.liquidity,
    finalGauges.confidence,
    finalGauges.stability,
    finalGauges.regulatory
  );

  // Small bonus when exact legacy threshold also passes
  const bonus = legacyEval.success ? 6 : 0;
  const compositeScore = Math.min(100, Math.round(gaugeScore + bonus));
  const grade = getGradeFromScore(compositeScore, minGauge);
  const passed = compositeScore >= 62 && finalGauges.stability >= 48 && finalGauges.liquidity >= 42;

  const keyDecisionsBreakdown = decisionLog.map((entry) => {
    return `${entry.dayLabel} — "${entry.optionTitle}": ${entry.rationale}`;
  });

  const pEnd = fiveStageParams[4] || scenario.initialParameters;
  let mechanismAnalysis = scenario.mechanismPlainSummary;
  if (scenario.domain === 'microstructure') {
    const prices = simData.map((d) => d.price as number);
    const minP = Math.min(...prices);
    mechanismAnalysis += ` Final algorithmic participation settled near ${pEnd.hftSpeed.toFixed(0)}%, with order-book depth stabilizing around ${pEnd.liquidityDepth.toFixed(0)} units and trough index price at $${minP.toFixed(2)}.`;
  } else if (scenario.domain === 'assetPrice') {
    const prices = simData.map((d) => d.chPrice as number);
    const peakP = Math.max(...prices);
    const endP = prices[prices.length - 1];
    mechanismAnalysis += ` Across the 300-day horizon, speculative pricing peaked at $${peakP.toFixed(1)} and closed at $${endP.toFixed(1)}, governed by a Hurst memory exponent of ${pEnd.hurstExponent.toFixed(2)} and GARCH volatility feedback of ${pEnd.volatilityFeedback.toFixed(2)}.`;
  } else {
    const gdps = simData.map((d) => d.chGDP as number);
    const minG = Math.min(...gdps);
    const endG = gdps[gdps.length - 1];
    mechanismAnalysis += ` Over 40 quarters, output dipped to a trough of ${minG.toFixed(1)} and finished at ${endG.toFixed(1)} index points, under a ${pEnd.leverageLimit.toFixed(1)}x leverage cap and ${pEnd.centralBankRate.toFixed(2)}% policy rate.`;
  }

  const summary = passed
    ? `Crisis Contained (${grade}). Your sequence of executive directives kept systemic feedback loops from cascading into irreversible collapse.`
    : `Containment Breached (${grade}). Competing market pressures overwhelmed system buffers before stabilization policies could arrest the feedback loop.`;

  return {
    grade,
    passed,
    compositeScore,
    finalGauges,
    summary,
    keyDecisionsBreakdown,
    mechanismAnalysis,
    challengeMetrics: legacyEval.metrics,
  };
}

export function getNarrationForState(
  stage: ExecutiveScenario['stages'][number],
  gauges: GaugeValues
): string {
  if (gauges.stability >= 65) return stage.narrations.calm;
  if (gauges.stability >= 45) return stage.narrations.tense;
  return stage.narrations.panic;
}

export function exportDecisionLogTxt(
  scenario: ExecutiveScenario,
  log: DecisionLogEntry[],
  evaluation: FinalEvaluation | null
): string {
  const lines: string[] = [
    `FINANCIAL CRISIS COMMAND SIMULATOR — EXECUTIVE DECISION LOG`,
    `============================================================`,
    `Scenario: ${scenario.title} (${scenario.year})`,
    `Role: ${scenario.role}, ${scenario.organization}`,
    `Domain: ${scenario.domain} | Era Skin: ${scenario.theme.eraLabel}`,
    `------------------------------------------------------------`,
    ``,
  ];

  if (log.length === 0) {
    lines.push('Crisis initiated. No decisions logged yet.');
  } else {
    log.forEach((entry) => {
      lines.push(`[${entry.dayLabel} | ${entry.timestamp}] ${entry.headline}`);
      lines.push(`  Directive: ${entry.optionTitle} (${entry.actionTag})`);
      lines.push(`  Rationale: ${entry.rationale}`);
      lines.push(
        `  Gauges -> Liquidity: ${entry.gaugesAfter.liquidity}% | Confidence: ${entry.gaugesAfter.confidence}% | Stability: ${entry.gaugesAfter.stability}% | Standing: ${entry.gaugesAfter.regulatory}%`
      );
      lines.push(``);
    });
  }

  if (evaluation) {
    lines.push(`------------------------------------------------------------`);
    lines.push(`FINAL GRADE: ${evaluation.grade} (${evaluation.compositeScore}/100) — ${evaluation.passed ? 'CONTAINED' : 'BREACHED'}`);
    lines.push(`Summary: ${evaluation.summary}`);
    lines.push(`Mechanism: ${evaluation.mechanismAnalysis}`);
  }

  return lines.join('\n');
}

export function exportDecisionLogJson(
  scenario: ExecutiveScenario,
  log: DecisionLogEntry[],
  evaluation: FinalEvaluation | null
): string {
  return JSON.stringify(
    {
      simulator: 'Financial Crisis Command Simulator',
      engine: '100% Static State Engine',
      scenario: {
        id: scenario.id,
        title: scenario.title,
        year: scenario.year,
        domain: scenario.domain,
        role: scenario.role,
        organization: scenario.organization,
      },
      decisions: log,
      evaluation,
    },
    null,
    2
  );
}
