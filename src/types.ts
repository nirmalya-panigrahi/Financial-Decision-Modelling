/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MicrostructureDataPoint {
  time: number;
  price: number;
  bidDepth: number;
  askDepth: number;
  volume: number;
  spread: number;
  hftRatio: number;
}

export interface AssetPriceDataPoint {
  time: number;
  linearPrice: number;
  chPrice: number;
  linearVol: number;
  chVol: number;
  linearReturn: number;
  chReturn: number;
}

export interface MacroCycleDataPoint {
  time: number;
  linearGDP: number;
  chGDP: number; // also known as chaotic/bifurcating GDP
  leverage: number;
  potentialStable: number;
  potentialChaotic: number;
  recessionLevel: number;
}

export interface SimulationResult {
  microstructure: MicrostructureDataPoint[];
  assetPrice: AssetPriceDataPoint[];
  macroCycle: MacroCycleDataPoint[];
}

export interface SystemParameters {
  // Microstructure parameters
  liquidityDepth: number; // 10-100
  hftSpeed: number; // 1-100
  triggerSellSize: number; // 100-1000
  marketMakersPresence: number; // 5-100

  // Asset price parameters
  meanReversion: number; // 0.05-1.0
  volatilityFeedback: number; // 0-2.0
  hurstExponent: number; // 0.1-0.9
  bubbleGrowthRate: number; // 0-0.1

  // Macroeconomics parameters
  leverageLimit: number; // 1.0 - 5.0
  centralBankRate: number; // 0% - 15%
  shockMagnitude: number; // 0-100
  recoveryRegenerationSpeed: number; // 1-10
}

export type SectionType = 'hero' | 'microstructure' | 'assetPrice' | 'macroCycle' | 'portal' | 'game';

export interface HistoricalCrisisPreset {
  id: string;
  name: string;
  year: string;
  contextId: SectionType;
  description: string;
  defaultRegime: 'linear' | 'weakly-nonlinear' | 'chaotic';
  parameters: Partial<SystemParameters>;
}

export type ScenarioDomain = 'microstructure' | 'assetPrice' | 'macroCycle';
export type RegimeType = 'linear' | 'weakly-nonlinear' | 'chaotic';
export type GaugeKey = 'liquidity' | 'confidence' | 'stability' | 'regulatory';
export type GaugeValues = Record<GaugeKey, number>;
export type DirectionBand = 'up-a-lot' | 'up' | 'flat' | 'down' | 'down-a-lot';
export type GradeLetter = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'C' | 'D' | 'F';

export type ThemeGaugeStyle = 'bar' | 'needle' | 'ledger' | 'led' | 'segment';
export type ThemeChartStyle = 'ticker-tape' | 'pen-plotter' | 'phosphor' | 'candles' | 'flat';
export type ThemeMotionStyle = 'typing' | 'flicker' | 'stamp' | 'none';

export interface ScenarioTheme {
  id: string;
  eraLabel: string;
  swatch: [string, string, string];
  isLight: boolean;
  colors: {
    bg: string;
    surface: string;
    surfaceAlt: string;
    border: string;
    text: string;
    muted: string;
    accent: string;
    accentText: string;
    good: string;
    warn: string;
    bad: string;
  };
  fonts: {
    heading: string;
    body: string;
    mono: string;
  };
  texture: string;
  radius: string;
  borderStyle: string;
  shadowStyle: string;
  labels: {
    gauges: [string, string, string, string]; // ordered: liquidity, confidence, stability, regulatory
    panelTitles: {
      narration: string;
      intel: string;
      terminal: string;
      history: string;
      telemetry: string;
    };
    optionPrefix: string;
    buttonText: string;
    mastheadTitle: string;
    mastheadCode: string;
  };
  gaugeStyle: ThemeGaugeStyle;
  chartStyle: ThemeChartStyle;
  headerChrome: string;
  motion: ThemeMotionStyle;
}

export interface DecisionOption {
  id: string;
  title: string;
  description: string; // 2 sentences of plain business English
  /** Deltas expressed as fraction of each slider's range (e.g. -0.30 = -30% of [min..max]) */
  deltas: Partial<Record<keyof SystemParameters, number>>;
  /** Plain-language explanation of this policy lever for the post-T5 debrief */
  rationale: string;
  /** Short tag for decision history */
  actionTag: string;
}

export interface DepartmentIntel {
  id: string;
  role: string;
  department: string;
  timestamp: string;
  brief: string;
  /** Whether this brief is incomplete or carries institutional bias (for post-T5 insight) */
  isBiased?: boolean;
}

export interface StageNarrationVariants {
  /** Shown when Systemic Stability >= 65 and drawdown is contained */
  calm: string;
  /** Shown when Systemic Stability is 45..64 */
  tense: string;
  /** Shown when Systemic Stability < 45 or acute drawdown */
  panic: string;
}

export interface ScenarioStage {
  stageNumber: 1 | 2 | 3 | 4 | 5;
  dayLabel: string; // e.g. "DAY 1"
  headline: string;
  timestamp: string;
  refCode: string;
  narrations: StageNarrationVariants;
  intel: [DepartmentIntel, DepartmentIntel, DepartmentIntel];
  options: [DecisionOption, DecisionOption, DecisionOption];
}

export interface ExecutiveScenario {
  id: string;
  challengeId: string;
  presetId: string;
  title: string;
  year: string;
  domain: ScenarioDomain;
  regime: RegimeType;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  role: string;
  organization: string;
  caseListBlurb: string;
  theme: ScenarioTheme;
  initialParameters: SystemParameters;
  mechanismName: string;
  mechanismPlainSummary: string;
  mathematics: string;
  mathExplanation: string;
  historyTruth: string;
  goalSummary: string;
  stages: [ScenarioStage, ScenarioStage, ScenarioStage, ScenarioStage, ScenarioStage];
}

export interface DecisionLogEntry {
  stageNumber: number;
  dayLabel: string;
  timestamp: string;
  headline: string;
  optionId: string;
  optionTitle: string;
  actionTag: string;
  rationale: string;
  gaugesAfter: GaugeValues;
  solverSnapshotLabel: string;
}

export interface FinalEvaluation {
  grade: GradeLetter;
  passed: boolean;
  compositeScore: number;
  finalGauges: GaugeValues;
  summary: string;
  keyDecisionsBreakdown: string[];
  mechanismAnalysis: string;
  challengeMetrics: Record<string, string | number>;
}

export interface ScenarioCompletionRecord {
  bestGrade: GradeLetter;
  bestScore: number;
  passed: boolean;
  lastPlayedIso: string;
}
