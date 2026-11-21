import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  Eye,
  EyeOff,
  FileText,
  History,
  Info,
  Palette,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { EXECUTIVE_SCENARIOS } from '../data/scenarios';
import { DEFAULT_COMMAND_THEME } from '../data/themes';
import {
  DecisionLogEntry,
  DecisionOption,
  DirectionBand,
  ExecutiveScenario,
  FinalEvaluation,
  GaugeKey,
  GaugeValues,
  ScenarioCompletionRecord,
  SystemParameters,
} from '../types';
import {
  applyOptionDeltas,
  compareGrades,
  computeStageGauges,
  evaluateFinalOutcome,
  exportDecisionLogJson,
  exportDecisionLogTxt,
  getLimitForPeriod,
  getNarrationForState,
  previewOptionDirectionBands,
  runScenarioSolver,
} from '../utils/gameEngine';
import CaseListView from './CaseListView';
import {
  CrisisLogoSvg,
  MarketTelemetryChart,
  ThemedGaugeCard,
  ThemeHeaderChrome,
} from './ThemeVisuals';

const STORAGE_KEY = 'fcm_executive_completions_v1';

const GAUGE_KEYS: GaugeKey[] = ['liquidity', 'confidence', 'stability', 'regulatory'];

function formatDirectionBand(band: DirectionBand): { label: string; tone: 'good' | 'warn' | 'bad' | 'flat' } {
  switch (band) {
    case 'up-a-lot':
      return { label: '▲▲ Up a lot', tone: 'good' };
    case 'up':
      return { label: '▲ Up', tone: 'good' };
    case 'down':
      return { label: '▼ Down', tone: 'warn' };
    case 'down-a-lot':
      return { label: '▼▼ Down a lot', tone: 'bad' };
    default:
      return { label: '— Flat', tone: 'flat' };
  }
}

export default function CrisisGame() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [periodStylingEnabled, setPeriodStylingEnabled] = useState<boolean>(true);
  const [hidePreviews, setHidePreviews] = useState<boolean>(false);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const [showBehindMaths, setShowBehindMaths] = useState<boolean>(false);

  // Per-run interactive state
  const [stageIndex, setStageIndex] = useState<number>(0); // 0..4 while playing; 5 when finished
  const [fiveStageParams, setFiveStageParams] = useState<SystemParameters[]>([]);
  const [currentGauges, setCurrentGauges] = useState<GaugeValues>({
    liquidity: 60,
    confidence: 60,
    stability: 60,
    regulatory: 60,
  });
  const [decisionLog, setDecisionLog] = useState<DecisionLogEntry[]>([]);
  const [activeIntelTab, setActiveIntelTab] = useState<number>(0);
  const [hoveredOptionId, setHoveredOptionId] = useState<string | null>(null);
  const [finalEvaluation, setFinalEvaluation] = useState<FinalEvaluation | null>(null);
  const [lastApprovedTitle, setLastApprovedTitle] = useState<string | null>(null);

  // Persistent completion records (localStorage)
  const [completions, setCompletions] = useState<Record<string, ScenarioCompletionRecord>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const activeScenario: ExecutiveScenario | null = useMemo(() => {
    return EXECUTIVE_SCENARIOS.find((s) => s.id === selectedScenarioId) || null;
  }, [selectedScenarioId]);

  const activeTheme = useMemo(() => {
    if (!activeScenario || !periodStylingEnabled) return DEFAULT_COMMAND_THEME;
    return activeScenario.theme;
  }, [activeScenario, periodStylingEnabled]);

  const initializeScenario = (scenario: ExecutiveScenario) => {
    const initialArray = Array.from({ length: 5 }, () => ({ ...scenario.initialParameters }));
    const initialSim = runScenarioSolver(scenario, initialArray);
    const initialGauges = computeStageGauges(
      scenario,
      initialSim,
      0,
      scenario.initialParameters
    );

    setFiveStageParams(initialArray);
    setCurrentGauges(initialGauges);
    setStageIndex(0);
    setDecisionLog([]);
    setActiveIntelTab(0);
    setHoveredOptionId(null);
    setFinalEvaluation(null);
    setShowBehindMaths(false);
    setShowExportMenu(false);
    setLastApprovedTitle(null);
  };

  useEffect(() => {
    if (activeScenario) {
      initializeScenario(activeScenario);
    }
  }, [selectedScenarioId]);

  const handleReset = () => {
    if (activeScenario) {
      initializeScenario(activeScenario);
    }
  };

  const handleReturnToCaseList = () => {
    setSelectedScenarioId(null);
    setFinalEvaluation(null);
    setShowExportMenu(false);
  };

  // Current solver trajectory based on committed parameters
  const currentSimData = useMemo(() => {
    if (!activeScenario || fiveStageParams.length === 0) return [];
    return runScenarioSolver(activeScenario, fiveStageParams);
  }, [activeScenario, fiveStageParams]);

  // Revealed trajectory points (grows after each committed decision)
  const revealedPointCount = useMemo(() => {
    if (!activeScenario || !currentSimData.length) return 0;
    if (decisionLog.length === 0) {
      return Math.max(4, Math.floor(getLimitForPeriod(activeScenario.domain, 0) * 0.25));
    }
    const lastCompletedStage = Math.min(4, decisionLog.length - 1);
    return getLimitForPeriod(activeScenario.domain, lastCompletedStage);
  }, [activeScenario, currentSimData, decisionLog.length]);

  const currentStage = useMemo(() => {
    if (!activeScenario) return null;
    const safeIdx = Math.min(4, stageIndex);
    return activeScenario.stages[safeIdx];
  }, [activeScenario, stageIndex]);

  const dynamicNarration = useMemo(() => {
    if (!currentStage) return '';
    return getNarrationForState(currentStage, currentGauges);
  }, [currentStage, currentGauges]);

  // Hover-to-analyse dry run (zero state mutation, direction bands only)
  const hoveredBands = useMemo(() => {
    if (
      hidePreviews ||
      !activeScenario ||
      !currentStage ||
      !hoveredOptionId ||
      finalEvaluation
    ) {
      return null;
    }
    const opt = currentStage.options.find((o) => o.id === hoveredOptionId);
    if (!opt) return null;
    return previewOptionDirectionBands(
      activeScenario,
      fiveStageParams,
      stageIndex,
      opt.deltas,
      currentGauges
    );
  }, [hidePreviews, activeScenario, currentStage, hoveredOptionId, finalEvaluation, fiveStageParams, stageIndex, currentGauges]);

  const handleCommitOption = (option: DecisionOption) => {
    if (!activeScenario || !currentStage || finalEvaluation || stageIndex > 4) return;

    const baseParams =
      stageIndex === 0
        ? activeScenario.initialParameters
        : fiveStageParams[stageIndex - 1] || activeScenario.initialParameters;

    const nextStageParams = applyOptionDeltas(baseParams, option.deltas);
    const updatedParamsList = fiveStageParams.map((p, idx) =>
      idx >= stageIndex ? nextStageParams : p
    );

    const nextSim = runScenarioSolver(activeScenario, updatedParamsList);
    const nextGauges = computeStageGauges(
      activeScenario,
      nextSim,
      stageIndex,
      nextStageParams,
      currentGauges
    );

    const snapshotIdx = Math.min(
      nextSim.length - 1,
      getLimitForPeriod(activeScenario.domain, stageIndex) - 1
    );
    const pt = nextSim[snapshotIdx];
    const snapshotLabel =
      activeScenario.domain === 'microstructure'
        ? `Price $${Number(pt?.price ?? 100).toFixed(2)} · Spread ${Number(pt?.spread ?? 0.05).toFixed(2)}`
        : activeScenario.domain === 'assetPrice'
        ? `Asset $${Number(pt?.chPrice ?? 100).toFixed(1)} · Vol ${Number(pt?.chVol ?? 1).toFixed(1)}%`
        : `GDP ${Number(pt?.chGDP ?? 100).toFixed(1)} pts · Lev ${Number(pt?.leverage ?? 2).toFixed(2)}x`;

    const logEntry: DecisionLogEntry = {
      stageNumber: currentStage.stageNumber,
      dayLabel: currentStage.dayLabel,
      timestamp: currentStage.timestamp,
      headline: currentStage.headline,
      optionId: option.id,
      optionTitle: option.title,
      actionTag: option.actionTag,
      rationale: option.rationale,
      gaugesAfter: nextGauges,
      solverSnapshotLabel: snapshotLabel,
    };

    const nextLog = [...decisionLog, logEntry];
    setFiveStageParams(updatedParamsList);
    setCurrentGauges(nextGauges);
    setDecisionLog(nextLog);
    setHoveredOptionId(null);
    setActiveIntelTab(0);
    setLastApprovedTitle(option.title);

    if (stageIndex === 4) {
      const evalResult = evaluateFinalOutcome(
        activeScenario,
        nextSim,
        updatedParamsList,
        nextGauges,
        nextLog
      );
      setFinalEvaluation(evalResult);
      setStageIndex(5);

      // Persist best completion grade in localStorage
      setCompletions((prev) => {
        const existing = prev[activeScenario.id];
        const betterGrade =
          !existing || compareGrades(evalResult.grade, existing.bestGrade) > 0
            ? evalResult.grade
            : existing.bestGrade;
        const updated: Record<string, ScenarioCompletionRecord> = {
          ...prev,
          [activeScenario.id]: {
            bestGrade: betterGrade,
            bestScore: Math.max(existing?.bestScore ?? 0, evalResult.compositeScore),
            passed: Boolean(existing?.passed || evalResult.passed),
            lastPlayedIso: new Date().toISOString(),
          },
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // ignore storage quota failures
        }
        return updated;
      });
    } else {
      setStageIndex(stageIndex + 1);
    }
  };

  const triggerDownload = (format: 'txt' | 'json') => {
    if (!activeScenario) return;
    const content =
      format === 'txt'
        ? exportDecisionLogTxt(activeScenario, decisionLog, finalEvaluation)
        : exportDecisionLogJson(activeScenario, decisionLog, finalEvaluation);
    const blob = new Blob([content], {
      type: format === 'txt' ? 'text/plain;charset=utf-8' : 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${activeScenario.id}-decision-log.${format}`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  if (!activeScenario) {
    return (
      <CaseListView
        scenarios={EXECUTIVE_SCENARIOS}
        completions={completions}
        onSelectScenario={(id) => setSelectedScenarioId(id)}
      />
    );
  }

  const c = activeTheme.colors;
  const isWin98 = activeTheme.id === 'win98_1998';
  const isBrutalist = activeTheme.id === 'brutalist2034';
  const isNewsprint = activeTheme.id === 'newsprint1929';
  const isCrt = activeTheme.id === 'crt1987';
  const is2008 = activeTheme.id === 'terminal2008';
  const is2010 = activeTheme.id === 'hft2010';
  const isEuro = activeTheme.id === 'eurozone2011';

  const statusColor =
    currentGauges.stability >= 65 ? c.good : currentGauges.stability >= 45 ? c.warn : c.bad;
  const severityBadge =
    currentGauges.stability >= 65 ? 'INFO' : currentGauges.stability >= 45 ? 'WARN' : 'CRITICAL';

  const panelClass = `border p-4 sm:p-5 ${isWin98 ? 'win98-bevel-out border-0' : ''} ${
    isBrutalist ? 'border-2' : ''
  }`;
  const panelStyle: React.CSSProperties = {
    backgroundColor: c.surface,
    borderColor: c.border,
    borderRadius: activeTheme.radius,
    borderStyle: activeTheme.borderStyle,
    boxShadow: activeTheme.shadowStyle,
    color: c.text,
  };

  const buttonClass = `px-3 py-1.5 text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 focus-visible:outline-2 ${
    isWin98 ? 'win98-bevel-out border-0 active:win98-bevel-in' : ''
  }`;
  const buttonStyle: React.CSSProperties = {
    backgroundColor: c.surfaceAlt,
    borderColor: c.border,
    color: c.text,
    borderRadius: activeTheme.radius,
    fontFamily: activeTheme.fonts.mono,
  };

  return (
    <div
      className={`min-h-screen flex flex-col ${activeTheme.texture} ${
        isCrt && activeTheme.motion === 'flicker' ? 'crt-flicker' : ''
      }`}
      style={{
        backgroundColor: c.bg,
        color: c.text,
        fontFamily: activeTheme.fonts.body,
      }}
    >
      {/* Optional Period Decorative Chrome */}
      <ThemeHeaderChrome theme={activeTheme} />

      {/* Main Header (Identical Structure Across All Themes) */}
      <header
        className="w-full border-b px-4 sm:px-6 py-3.5"
        style={{
          backgroundColor: c.surface,
          borderColor: c.border,
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <CrisisLogoSvg accent={c.accent} size={30} />
            <div className="min-w-0">
              <h1
                className="text-base sm:text-lg font-bold tracking-tight truncate"
                style={{ fontFamily: activeTheme.fonts.heading }}
              >
                {activeScenario.title}
              </h1>
              <p className="text-xs truncate" style={{ color: c.muted, fontFamily: activeTheme.fonts.mono }}>
                {activeScenario.role} · {activeScenario.organization} ({activeScenario.year})
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleReturnToCaseList}
              className={buttonClass}
              style={buttonStyle}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Case List</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className={buttonClass}
              style={buttonStyle}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu((v) => !v)}
                className={buttonClass}
                style={buttonStyle}
                aria-expanded={showExportMenu}
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export</span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {showExportMenu && (
                <div
                  className="absolute right-0 mt-1.5 w-44 border z-30 py-1 shadow-lg"
                  style={{
                    backgroundColor: c.surface,
                    borderColor: c.border,
                    borderRadius: activeTheme.radius,
                    fontFamily: activeTheme.fonts.mono,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => triggerDownload('txt')}
                    className="w-full text-left px-3 py-2 text-xs hover:opacity-80 flex items-center gap-2 cursor-pointer"
                    style={{ color: c.text }}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Export Log (.txt)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerDownload('json')}
                    className="w-full text-left px-3 py-2 text-xs hover:opacity-80 flex items-center gap-2 cursor-pointer"
                    style={{ color: c.text }}
                  >
                    <Terminal className="h-3.5 w-3.5" />
                    <span>Export Log (.json)</span>
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setPeriodStylingEnabled((v) => !v)}
              className={buttonClass}
              style={{
                ...buttonStyle,
                backgroundColor: periodStylingEnabled ? c.accent : c.surfaceAlt,
                color: periodStylingEnabled ? c.accentText : c.text,
              }}
              aria-pressed={periodStylingEnabled}
            >
              <Palette className="h-3.5 w-3.5" />
              <span>Period styling: {periodStylingEnabled ? 'On' : 'Off'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* TOP ROW: Four Gauge Cards */}
        <section aria-label="Systemic Health Gauges" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {GAUGE_KEYS.map((key, idx) => (
            <div key={key} className="contents">
              <ThemedGaugeCard
                gaugeKey={key}
                label={activeTheme.labels.gauges[idx]}
                value={currentGauges[key]}
                theme={activeTheme}
                index={idx}
              />
            </div>
          ))}
        </section>

        {/* DIVIDER: WAR-ROOM-FEED */}
        <div className="flex items-center gap-4 select-none" role="separator">
          <div className="h-px flex-1" style={{ backgroundColor: c.border }} />
          <span
            className="text-[11px] font-bold tracking-[0.22em] uppercase px-2"
            style={{ color: c.muted, fontFamily: activeTheme.fonts.mono }}
          >
            WAR-ROOM-FEED
          </span>
          <div className="h-px flex-1" style={{ backgroundColor: c.border }} />
        </div>

        {/* TWO-COLUMN WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: (a) Scenario Narration, (b) Asymmetric Departmental Intel, (c) Executive Decision History */}
          <div className="lg:col-span-7 space-y-5">
            {/* (a) Scenario Card */}
            <article className={panelClass} style={panelStyle}>
              <div
                className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b"
                style={{ borderColor: c.border }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: statusColor }}
                    aria-hidden="true"
                  />
                  <span
                    className="text-xs font-bold uppercase tracking-wider truncate"
                    style={{ color: c.accent, fontFamily: activeTheme.fonts.mono }}
                  >
                    {activeTheme.labels.panelTitles.narration}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] shrink-0" style={{ fontFamily: activeTheme.fonts.mono }}>
                  {is2010 && (
                    <span
                      className="px-1.5 py-0.5 font-bold border"
                      style={{ color: statusColor, borderColor: statusColor }}
                    >
                      {severityBadge}
                    </span>
                  )}
                  {isEuro && currentStage && (
                    <span style={{ color: c.muted }}>REF: {currentStage.refCode}</span>
                  )}
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 border tabular-nums"
                    style={{
                      backgroundColor: c.surfaceAlt,
                      borderColor: c.border,
                      color: c.text,
                      borderRadius: activeTheme.radius,
                    }}
                  >
                    <Clock className="h-3 w-3" />
                    <span>{currentStage?.timestamp}</span>
                  </span>
                </div>
              </div>

              {/* Period-specific email / broadsheet metadata strip */}
              {is2008 && currentStage && (
                <div
                  className="mb-3 p-2.5 border text-xs space-y-0.5"
                  style={{
                    backgroundColor: c.surfaceAlt,
                    borderColor: c.border,
                    fontFamily: activeTheme.fonts.mono,
                  }}
                >
                  <div><strong style={{ color: c.accent }}>TO:</strong> Executive Risk Committee</div>
                  <div><strong style={{ color: c.accent }}>FROM:</strong> Meridian Floor &amp; Treasury Desk</div>
                  <div><strong style={{ color: c.accent }}>SUBJECT:</strong> [{currentStage.dayLabel}] {currentStage.headline}</div>
                </div>
              )}

              {isNewsprint && currentStage && (
                <div
                  className="mb-3 pb-2 border-b text-[11px] uppercase tracking-widest flex justify-between"
                  style={{ borderColor: c.border, color: c.muted, fontFamily: activeTheme.fonts.mono }}
                >
                  <span>WALL &amp; BROAD DISPATCH · {currentStage.refCode}</span>
                  <span>STAGE {currentStage.stageNumber} OF 5</span>
                </div>
              )}

              <div className="space-y-2.5">
                <h2
                  className={`font-bold leading-snug text-balance ${
                    isBrutalist ? 'text-2xl sm:text-3xl tracking-tight' : isNewsprint ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
                  }`}
                  style={{ fontFamily: activeTheme.fonts.heading }}
                >
                  {currentStage
                    ? `${currentStage.dayLabel}: ${currentStage.headline}`
                    : 'CRISIS CONCLUDED'}
                </h2>

                <p className="text-sm leading-relaxed" style={{ color: c.text }}>
                  {finalEvaluation
                    ? finalEvaluation.summary
                    : dynamicNarration}
                </p>

                <div
                  className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs border-t"
                  style={{ borderColor: c.border, color: c.muted, fontFamily: activeTheme.fonts.mono }}
                >
                  <span>Stage Progress: {Math.min(5, decisionLog.length)} / 5 Intervals</span>
                  <span className="truncate max-w-md" title={activeScenario.goalSummary}>
                    Target: {activeScenario.goalSummary.split(':')[0]}
                  </span>
                </div>
              </div>
            </article>

            {/* (b) Asymmetric Departmental Intel */}
            {currentStage && !finalEvaluation && (
              <section className={panelClass} style={panelStyle} aria-label="Asymmetric Departmental Intel">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b" style={{ borderColor: c.border }}>
                  <h3 className="text-xs font-bold uppercase tracking-wider" style={{ fontFamily: activeTheme.fonts.heading }}>
                    {activeTheme.labels.panelTitles.intel}
                  </h3>
                  <span className="text-[11px]" style={{ color: c.muted, fontFamily: activeTheme.fonts.mono }}>
                    Weigh partial &amp; biased briefs
                  </span>
                </div>

                {/* Role Tabs */}
                <div className="flex flex-wrap gap-1.5 mb-3" role="tablist">
                  {currentStage.intel.map((item, idx) => {
                    const active = idx === activeIntelTab;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setActiveIntelTab(idx)}
                        className={`px-3 py-1.5 text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                          isWin98 ? (active ? 'win98-bevel-in border-0' : 'win98-bevel-out border-0') : ''
                        }`}
                        style={{
                          backgroundColor: active ? c.accent : c.surfaceAlt,
                          color: active ? c.accentText : c.text,
                          borderColor: active ? c.accent : c.border,
                          borderRadius: activeTheme.radius,
                          fontFamily: activeTheme.fonts.mono,
                        }}
                      >
                        {item.role}
                      </button>
                    );
                  })}
                </div>

                {/* Active Brief Content */}
                {(() => {
                  const activeBrief = currentStage.intel[activeIntelTab] || currentStage.intel[0];
                  return (
                    <div
                      className={`p-3.5 border space-y-2 ${isWin98 ? 'win98-bevel-in border-0' : ''}`}
                      style={{
                        backgroundColor: c.surfaceAlt,
                        borderColor: c.border,
                        borderRadius: activeTheme.radius,
                        borderStyle: isNewsprint ? 'dashed' : activeTheme.borderStyle,
                      }}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]" style={{ color: c.muted, fontFamily: activeTheme.fonts.mono }}>
                        <span className="font-semibold" style={{ color: c.text }}>
                          {activeBrief.department}
                        </span>
                        <span className="tabular-nums">{activeBrief.timestamp}</span>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: c.text }}>
                        {activeBrief.brief}
                      </p>
                    </div>
                  );
                })()}
              </section>
            )}

            {/* (c) Executive Decision History */}
            <section className={panelClass} style={panelStyle} aria-label="Executive Decision History">
              <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b" style={{ borderColor: c.border }}>
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 shrink-0" style={{ color: c.accent }} />
                  <h3 className="text-xs font-bold uppercase tracking-wider" style={{ fontFamily: activeTheme.fonts.heading }}>
                    {activeTheme.labels.panelTitles.history}
                  </h3>
                </div>
                <span className="text-[11px] tabular-nums" style={{ color: c.muted, fontFamily: activeTheme.fonts.mono }}>
                  {decisionLog.length} Logged
                </span>
              </div>

              {decisionLog.length === 0 ? (
                <p className="text-xs py-2" style={{ color: c.muted, fontFamily: activeTheme.fonts.mono }}>
                  Crisis initiated. No decisions logged yet.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {decisionLog.map((entry, idx) => (
                    <div
                      key={`${entry.stageNumber}-${entry.optionId}`}
                      className="p-3 border flex flex-col gap-1.5"
                      style={{
                        backgroundColor: c.surfaceAlt,
                        borderColor: c.border,
                        borderRadius: activeTheme.radius,
                        borderStyle: isNewsprint || activeTheme.id === 'fanfold1978' ? 'dashed' : 'solid',
                      }}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]" style={{ fontFamily: activeTheme.fonts.mono }}>
                        <span className="font-bold" style={{ color: c.accent }}>
                          #{idx + 1} · {entry.dayLabel} · {entry.actionTag}
                        </span>
                        <span className="tabular-nums" style={{ color: c.muted }}>
                          {entry.timestamp}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold">{entry.optionTitle}</span>
                        {isNewsprint && (
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 border-2 uppercase tracking-widest shrink-0 -rotate-2"
                            style={{ color: c.accent, borderColor: c.accent, fontFamily: activeTheme.fonts.mono }}
                          >
                            APPROVED
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] tabular-nums" style={{ color: c.muted, fontFamily: activeTheme.fonts.mono }}>
                        {entry.solverSnapshotLabel}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* RIGHT COLUMN: Decision Terminal (or Post-T5 Grade & Debrief) + Market Telemetry */}
          <div className="lg:col-span-5 space-y-5">
            {!finalEvaluation && currentStage ? (
              <section className={panelClass} style={panelStyle} aria-label="Decision Terminal">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b" style={{ borderColor: c.border }}>
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 shrink-0" style={{ color: c.accent }} />
                    <h3 className="text-xs font-bold uppercase tracking-wider" style={{ fontFamily: activeTheme.fonts.heading }}>
                      {activeTheme.labels.panelTitles.terminal}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setHidePreviews((v) => !v)}
                    className="inline-flex items-center gap-1.5 text-[11px] px-2 py-1 border cursor-pointer"
                    style={{
                      backgroundColor: c.surfaceAlt,
                      borderColor: c.border,
                      color: c.muted,
                      borderRadius: activeTheme.radius,
                      fontFamily: activeTheme.fonts.mono,
                    }}
                    aria-pressed={hidePreviews}
                  >
                    {hidePreviews ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    <span>{hidePreviews ? 'Previews hidden' : 'Hide previews'}</span>
                  </button>
                </div>

                {/* Impact Analysis Box (Hover-to-Analyse, Direction Bands Only) */}
                <div
                  className={`p-3 mb-4 border ${isWin98 ? 'win98-bevel-in border-0' : ''}`}
                  style={{
                    backgroundColor: c.surfaceAlt,
                    borderColor: c.border,
                    borderRadius: activeTheme.radius,
                  }}
                >
                  {hidePreviews ? (
                    <p className="text-xs" style={{ color: c.muted, fontFamily: activeTheme.fonts.mono }}>
                      Impact previews disabled. Evaluate departmental briefs directly.
                    </p>
                  ) : hoveredBands ? (
                    <div className="space-y-2">
                      <span
                        className="text-[11px] font-bold uppercase tracking-wider block"
                        style={{ color: c.accent, fontFamily: activeTheme.fonts.mono }}
                      >
                        Projected Directional Impact (Dry-Run)
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {GAUGE_KEYS.map((k, idx) => {
                          const info = formatDirectionBand(hoveredBands[k]);
                          const toneColor =
                            info.tone === 'good'
                              ? c.good
                              : info.tone === 'warn'
                              ? c.warn
                              : info.tone === 'bad'
                              ? c.bad
                              : c.muted;
                          return (
                            <div
                              key={k}
                              className="flex items-center justify-between gap-1 text-[11px] px-2 py-1 border"
                              style={{
                                backgroundColor: c.surface,
                                borderColor: c.border,
                                borderRadius: activeTheme.radius,
                                fontFamily: activeTheme.fonts.mono,
                              }}
                            >
                              <span className="truncate" style={{ color: c.muted }}>
                                {activeTheme.labels.gauges[idx]}
                              </span>
                              <span className="font-bold shrink-0" style={{ color: toneColor }}>
                                {info.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs" style={{ color: c.muted, fontFamily: activeTheme.fonts.mono }}>
                      Hover over an option to analyze impact
                    </p>
                  )}
                </div>

                {/* Three Business-Language Option Cards */}
                <div className="space-y-3">
                  {currentStage.options.map((opt, idx) => {
                    const isHovered = hoveredOptionId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onMouseEnter={() => setHoveredOptionId(opt.id)}
                        onMouseLeave={() => setHoveredOptionId((prev) => (prev === opt.id ? null : prev))}
                        onFocus={() => setHoveredOptionId(opt.id)}
                        onBlur={() => setHoveredOptionId((prev) => (prev === opt.id ? null : prev))}
                        onClick={() => handleCommitOption(opt)}
                        className={`w-full text-left p-3.5 border transition-colors cursor-pointer flex flex-col gap-2 focus-visible:outline-2 ${
                          isWin98 ? 'win98-bevel-out border-0 active:win98-bevel-in' : ''
                        }`}
                        style={{
                          backgroundColor: isHovered ? c.surfaceAlt : c.bg,
                          borderColor: isHovered ? c.accent : c.border,
                          borderRadius: activeTheme.radius,
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 min-w-0">
                            <span
                              className="text-[11px] font-bold uppercase tracking-wider block"
                              style={{ color: c.accent, fontFamily: activeTheme.fonts.mono }}
                            >
                              {isCrt ? `[${idx + 1}] ` : `${activeTheme.labels.optionPrefix} ${idx + 1} · `}
                              {opt.actionTag}
                              {isCrt && isHovered && <span className="crt-cursor ml-1">_</span>}
                            </span>
                            <h4
                              className="text-sm font-bold leading-snug"
                              style={{ fontFamily: activeTheme.fonts.heading }}
                            >
                              {opt.title}
                            </h4>
                          </div>

                          <span
                            className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold border"
                            style={{
                              backgroundColor: isHovered ? c.accent : c.surface,
                              color: isHovered ? c.accentText : c.text,
                              borderColor: isHovered ? c.accent : c.border,
                              borderRadius: activeTheme.radius,
                              fontFamily: activeTheme.fonts.mono,
                            }}
                          >
                            <span className="hidden sm:inline">{activeTheme.labels.buttonText}</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </span>
                        </div>

                        <p className="text-xs leading-relaxed" style={{ color: c.muted }}>
                          {opt.description}
                        </p>

                        {isEuro && (
                          <div
                            className="pt-1.5 border-t text-[10px] flex justify-between"
                            style={{ borderColor: c.border, color: c.muted, fontFamily: activeTheme.fonts.mono }}
                          >
                            <span>COMMISSIONER SIGNATURE: ____________________</span>
                            <span>COUNCIL SEAL</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {lastApprovedTitle && isNewsprint && (
                  <p className="mt-3 text-[11px]" style={{ color: c.muted, fontFamily: activeTheme.fonts.mono }}>
                    Last stamped memo: {lastApprovedTitle}
                  </p>
                )}
              </section>
            ) : finalEvaluation ? (
              /* Post-T5 Executive Debrief & A+ to F Grade */
              <section className={panelClass} style={panelStyle} aria-label="Post-Crisis Evaluation">
                <div className="flex items-center justify-between gap-3 pb-3 mb-4 border-b" style={{ borderColor: c.border }}>
                  <div className="flex items-center gap-2.5">
                    {finalEvaluation.passed ? (
                      <ShieldCheck className="h-5 w-5 shrink-0" style={{ color: c.good }} />
                    ) : (
                      <ShieldAlert className="h-5 w-5 shrink-0" style={{ color: c.bad }} />
                    )}
                    <div>
                      <span className="text-[11px] uppercase tracking-wider block" style={{ color: c.muted, fontFamily: activeTheme.fonts.mono }}>
                        Post-Crisis Debrief
                      </span>
                      <h3 className="text-base font-bold" style={{ fontFamily: activeTheme.fonts.heading }}>
                        {finalEvaluation.passed ? 'Systemic Crisis Contained' : 'Systemic Containment Failed'}
                      </h3>
                    </div>
                  </div>

                  <div
                    className="px-3.5 py-2 border text-center shrink-0"
                    style={{
                      backgroundColor: c.surfaceAlt,
                      borderColor: finalEvaluation.passed ? c.good : c.bad,
                      borderRadius: activeTheme.radius,
                      fontFamily: activeTheme.fonts.mono,
                    }}
                  >
                    <span
                      className="text-2xl font-extrabold block leading-none"
                      style={{ color: finalEvaluation.passed ? c.good : c.bad }}
                    >
                      {finalEvaluation.grade}
                    </span>
                    <span className="text-[10px] tabular-nums" style={{ color: c.muted }}>
                      {finalEvaluation.compositeScore}/100
                    </span>
                  </div>
                </div>

                <div className="space-y-4 text-xs leading-relaxed">
                  <p className="text-sm font-medium">{finalEvaluation.summary}</p>

                  {/* Mechanism at Work */}
                  <div
                    className="p-3 border space-y-1"
                    style={{ backgroundColor: c.surfaceAlt, borderColor: c.border, borderRadius: activeTheme.radius }}
                  >
                    <span className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: c.accent, fontFamily: activeTheme.fonts.mono }}>
                      Mechanism at Work · {activeScenario.mechanismName}
                    </span>
                    <p style={{ color: c.text }}>{finalEvaluation.mechanismAnalysis}</p>
                  </div>

                  {/* Solver Metrics */}
                  {Object.keys(finalEvaluation.challengeMetrics).length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(finalEvaluation.challengeMetrics).map(([k, v]) => (
                        <div
                          key={k}
                          className="p-2 border"
                          style={{ backgroundColor: c.bg, borderColor: c.border, borderRadius: activeTheme.radius, fontFamily: activeTheme.fonts.mono }}
                        >
                          <span className="text-[10px] block" style={{ color: c.muted }}>{k}</span>
                          <span className="text-xs font-bold tabular-nums">{v}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Which Decisions Mattered */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: c.muted, fontFamily: activeTheme.fonts.mono }}>
                      Key Decision Breakdown
                    </span>
                    <ul className="space-y-1.5">
                      {finalEvaluation.keyDecisionsBreakdown.map((item, idx) => (
                        <li
                          key={idx}
                          className="p-2 border text-xs"
                          style={{ backgroundColor: c.surfaceAlt, borderColor: c.border, borderRadius: activeTheme.radius }}
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={handleReset}
                      className={buttonClass}
                      style={{
                        ...buttonStyle,
                        backgroundColor: c.accent,
                        color: c.accentText,
                        borderColor: c.accent,
                      }}
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Play Again</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleReturnToCaseList}
                      className={buttonClass}
                      style={buttonStyle}
                    >
                      <span>Return to Case List</span>
                    </button>
                  </div>
                </div>
              </section>
            ) : null}

            {/* Market Telemetry SVG Chart Panel */}
            <MarketTelemetryChart
              domain={activeScenario.domain}
              simData={currentSimData}
              revealedCount={revealedPointCount}
              totalStagesCompleted={decisionLog.length}
              theme={activeTheme}
            />
          </div>
        </div>

        {/* Collapsible "Behind the Maths" Reference */}
        <section className="pt-2">
          <button
            type="button"
            onClick={() => setShowBehindMaths((v) => !v)}
            className="w-full py-3 px-4 border flex items-center justify-between text-xs font-bold cursor-pointer"
            style={{
              backgroundColor: c.surface,
              borderColor: c.border,
              color: c.text,
              borderRadius: activeTheme.radius,
              fontFamily: activeTheme.fonts.mono,
            }}
            aria-expanded={showBehindMaths}
          >
            <span className="inline-flex items-center gap-2">
              <BookOpen className="h-4 w-4" style={{ color: c.accent }} />
              <span>Behind the Maths — {activeScenario.mechanismName}</span>
            </span>
            <span style={{ color: c.muted }}>{showBehindMaths ? '▲ Hide' : '▼ Expand'}</span>
          </button>

          {showBehindMaths && (
            <div
              className="mt-3 p-5 border space-y-4"
              style={{
                backgroundColor: c.surface,
                borderColor: c.border,
                borderRadius: activeTheme.radius,
                color: c.text,
              }}
            >
              <div
                className="p-3.5 border text-center text-xs sm:text-sm font-bold overflow-x-auto"
                style={{
                  backgroundColor: c.bg,
                  borderColor: c.border,
                  color: c.accent,
                  fontFamily: activeTheme.fonts.mono,
                  borderRadius: activeTheme.radius,
                }}
              >
                {activeScenario.mathematics}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
                <div className="space-y-1.5">
                  <span className="font-bold uppercase tracking-wider block" style={{ color: c.accent, fontFamily: activeTheme.fonts.mono }}>
                    Mathematical Mechanism
                  </span>
                  <p>{activeScenario.mathExplanation}</p>
                </div>
                <div className="space-y-1.5">
                  <span className="font-bold uppercase tracking-wider block" style={{ color: c.accent, fontFamily: activeTheme.fonts.mono }}>
                    Historical Precedent &amp; Policy Reality
                  </span>
                  <p className="flex items-start gap-2">
                    <Info className="h-4 w-4 shrink-0 mt-0.5" style={{ color: c.muted }} />
                    <span>{activeScenario.historyTruth}</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Default Footer (Themes may restyle it but never remove it) */}
      <footer
        className="w-full border-t py-3.5 px-6 text-center text-xs"
        style={{
          backgroundColor: c.surface,
          borderColor: c.border,
          color: c.muted,
          fontFamily: activeTheme.fonts.mono,
        }}
      >
        Financial Crisis Command Simulator • 100% Static State Engine
      </footer>
    </div>
  );
}
