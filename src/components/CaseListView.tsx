import React from 'react';
import { ArrowRight, CheckCircle2, Cpu, Layers, TrendingUp } from 'lucide-react';
import {
  ExecutiveScenario,
  ScenarioCompletionRecord,
  ScenarioDomain,
} from '../types';
import { CrisisLogoSvg } from './ThemeVisuals';

interface CaseListViewProps {
  scenarios: ExecutiveScenario[];
  completions: Record<string, ScenarioCompletionRecord>;
  onSelectScenario: (id: string) => void;
}

const DOMAIN_META: {
  domain: ScenarioDomain;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    domain: 'microstructure',
    label: 'Market Microstructure Cascades',
    subtitle: 'Order-book liquidity vacuums, high-frequency feedback loops, and specialist capital buffers',
    icon: Cpu,
  },
  {
    domain: 'assetPrice',
    label: 'Speculative Bubble Chaos',
    subtitle: 'GARCH volatility clustering, Hurst herding persistence, and regime-switching corrections',
    icon: TrendingUp,
  },
  {
    domain: 'macroCycle',
    label: 'Macroeconomic GDP Cycles',
    subtitle: 'Credit-leverage bifurcations, double-well liquidity traps, and sovereign policy steering',
    icon: Layers,
  },
];

export default function CaseListView({
  scenarios,
  completions,
  onSelectScenario,
}: CaseListViewProps) {
  const completedCount = Object.values(completions).filter((c) => c.passed).length;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 theme-texture-grid flex flex-col">
      {/* Top Bar */}
      <header className="w-full border-b border-slate-800/90 bg-[#020617]/95 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <CrisisLogoSvg accent="#10b981" size={30} />
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-100 leading-tight">
                Financial Chaos Modelling
              </h1>
              <p className="text-xs text-slate-400">
                Executive Crisis Decision Simulator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-400 tabular-nums">
            <span>
              CASES CONTAINED: <strong className="text-emerald-400">{completedCount} / {scenarios.length}</strong>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-10">
        <section className="max-w-3xl space-y-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-emerald-400">
            CASE ARCHIVE · 9 DETERMINISTIC CRISIS SCENARIOS
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white text-balance">
            Step Into the Command Chair Across a Century of Financial Crises
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Select a historical or future case below. Every scenario runs in a period-accurate executive environment powered by deterministic non-linear chaos solvers across five unfolding stages. Weigh conflicting departmental briefs, analyze directive impact, and contain systemic contagion.
          </p>
        </section>

        {/* Grouped by Domain */}
        <div className="space-y-10">
          {DOMAIN_META.map((group) => {
            const Icon = group.icon;
            const groupScenarios = scenarios.filter((s) => s.domain === group.domain);

            return (
              <section key={group.domain} className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-2.5 border-b border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-emerald-400 shrink-0" />
                    <h3 className="font-mono text-xs uppercase tracking-[0.14em] text-slate-200 font-semibold">
                      {group.label}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400">{group.subtitle}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {groupScenarios.map((scenario) => {
                    const record = completions[scenario.id];
                    const diffColor =
                      scenario.difficulty === 'Easy'
                        ? 'text-emerald-400'
                        : scenario.difficulty === 'Medium'
                        ? 'text-amber-400'
                        : 'text-rose-400';

                    return (
                      <button
                        key={scenario.id}
                        type="button"
                        onClick={() => onSelectScenario(scenario.id)}
                        className="group text-left bg-[#0b1120] hover:bg-[#10182b] border border-slate-800 hover:border-slate-600 rounded-xl p-5 flex flex-col justify-between gap-4 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-400"
                      >
                        <div className="space-y-3">
                          {/* Era Swatch + Label & Difficulty */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="inline-flex items-center shrink-0" aria-hidden="true">
                                {scenario.theme.swatch.map((hex, i) => (
                                  <span
                                    key={i}
                                    className="w-2.5 h-2.5 border border-slate-700 first:rounded-l-xs last:rounded-r-xs"
                                    style={{ backgroundColor: hex }}
                                  />
                                ))}
                              </span>
                              <span className="font-mono text-[11px] uppercase tracking-wider text-slate-300 truncate">
                                {scenario.theme.eraLabel}
                              </span>
                            </div>

                            <span className={`font-mono text-[11px] uppercase tracking-wider font-semibold shrink-0 ${diffColor}`}>
                              {scenario.difficulty}
                            </span>
                          </div>

                          {/* Title & Role */}
                          <div className="space-y-1">
                            <h4 className="text-base font-semibold text-white group-hover:text-emerald-400 transition-colors">
                              {scenario.title}
                            </h4>
                            <p className="text-xs font-mono text-slate-400">
                              {scenario.role} · {scenario.organization}
                            </p>
                          </div>

                          {/* Blurb */}
                          <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                            {scenario.caseListBlurb}
                          </p>
                        </div>

                        {/* Card Footer */}
                        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs font-mono">
                          {record ? (
                            <span
                              className={`inline-flex items-center gap-1.5 font-semibold ${
                                record.passed ? 'text-emerald-400' : 'text-amber-400'
                              }`}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                              <span>
                                {record.passed ? 'Contained' : 'Attempted'} · Best: {record.bestGrade}
                              </span>
                            </span>
                          ) : (
                            <span className="text-slate-500">5 Stages · Unplayed</span>
                          )}

                          <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform whitespace-nowrap">
                            <span>Open Case</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </main>

      {/* Default Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-6 text-center text-xs font-mono text-slate-500">
        Financial Crisis Command Simulator • 100% Static State Engine
      </footer>
    </div>
  );
}
