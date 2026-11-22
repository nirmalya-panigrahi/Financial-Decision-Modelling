import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ScenarioDomain } from '../types';

export type HeroFilterDomain = ScenarioDomain | 'all';

interface HeroModelDiagramsProps {
  activeFilter: HeroFilterDomain;
  onSelectFilter: (filter: HeroFilterDomain) => void;
  onQuickLaunch: () => void;
}

function MicrostructureDiagramSvg() {
  return (
    <svg viewBox="0 0 160 160" className="w-32 h-32 mx-auto" fill="none" aria-hidden="true">
      {/* Dashed circular halo */}
      <circle cx="80" cy="80" r="64" stroke="#64748b" strokeWidth="1.25" strokeDasharray="5 4" strokeOpacity="0.6" />
      <circle cx="80" cy="80" r="46" fill="#1e3a8a" fillOpacity="0.18" />

      {/* Decorative technical ticks */}
      <circle cx="30" cy="46" r="2.2" fill="#38bdf8" fillOpacity="0.85" />
      <circle cx="132" cy="112" r="2.2" fill="#38bdf8" fillOpacity="0.85" />
      <path d="M126 42v6M123 45h6" stroke="#94a3b8" strokeWidth="1.3" strokeLinecap="round" />

      {/* Magnifying surveillance lens (top-left) */}
      <circle cx="56" cy="52" r="16" fill="#0f172a" stroke="#e2e8f0" strokeWidth="1.6" />
      <circle cx="56" cy="52" r="10" fill="#2563eb" fillOpacity="0.35" stroke="#38bdf8" strokeWidth="1.4" />
      <circle cx="56" cy="52" r="4" fill="#38bdf8" />
      <path d="M44 64l-8 8" stroke="#e2e8f0" strokeWidth="2.8" strokeLinecap="round" />

      {/* Automated order-routing arm (right) */}
      <path d="M116 108h18v7h-18z" fill="#2563eb" stroke="#e2e8f0" strokeWidth="1.4" />
      <path d="M125 108V82l-14-14-12 6" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="111" cy="68" r="4.5" fill="#38bdf8" stroke="#e2e8f0" strokeWidth="1.4" />
      <path d="M95 72l5 6M95 72l6-4" stroke="#38bdf8" strokeWidth="1.6" strokeLinecap="round" />

      {/* Order-book depth monitor (bottom-left) */}
      <rect x="34" y="80" width="60" height="38" rx="3" fill="#0f172a" stroke="#e2e8f0" strokeWidth="1.6" />
      <rect x="39" y="85" width="50" height="26" rx="1.5" fill="#1d4ed8" fillOpacity="0.28" />
      <path d="M56 118v7M46 125h36" stroke="#e2e8f0" strokeWidth="1.6" strokeLinecap="round" />
      {/* Depth bars inside monitor */}
      <rect x="44" y="99" width="7" height="10" fill="#38bdf8" />
      <rect x="54" y="94" width="7" height="15" fill="#60a5fa" />
      <rect x="64" y="90" width="7" height="19" fill="#38bdf8" />
      <rect x="74" y="102" width="7" height="7" fill="#34d399" />
    </svg>
  );
}

function BubbleDiagramSvg() {
  return (
    <svg viewBox="0 0 160 160" className="w-32 h-32 mx-auto" fill="none" aria-hidden="true">
      <circle cx="80" cy="80" r="64" stroke="#64748b" strokeWidth="1.25" strokeDasharray="5 4" strokeOpacity="0.6" />
      <circle cx="80" cy="80" r="46" fill="#1e3a8a" fillOpacity="0.18" />

      <circle cx="128" cy="52" r="2.2" fill="#38bdf8" fillOpacity="0.85" />
      <circle cx="32" cy="108" r="2.2" fill="#38bdf8" fillOpacity="0.85" />

      {/* Interlocking GARCH feedback gears (top-right) */}
      <circle cx="92" cy="48" r="14" fill="#0f172a" stroke="#e2e8f0" strokeWidth="1.6" />
      <circle cx="92" cy="48" r="5" fill="#38bdf8" />
      <path d="M92 30v4M92 62v4M74 48h4M106 48h4M79 35l3 3M102 58l3 3M105 35l-3 3M82 58l-3 3" stroke="#e2e8f0" strokeWidth="1.8" strokeLinecap="round" />

      <circle cx="117" cy="64" r="9.5" fill="#2563eb" fillOpacity="0.45" stroke="#e2e8f0" strokeWidth="1.5" />
      <circle cx="117" cy="64" r="3.5" fill="#e2e8f0" />

      {/* Speculative loop arrows (left) */}
      <path
        d="M34 86c0-10 8-16 18-16h12v-5l10 8-10 8v-5H52c-6 0-10 4-10 10"
        fill="#2563eb"
        fillOpacity="0.55"
        stroke="#38bdf8"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="48" cy="100" r="9" fill="#0f172a" stroke="#e2e8f0" strokeWidth="1.5" />
      <path d="M48 96v8M45 98l3-2" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />

      {/* Volatility waveform monitor (bottom-right) */}
      <rect x="74" y="84" width="54" height="36" rx="3" fill="#0f172a" stroke="#e2e8f0" strokeWidth="1.6" />
      <rect x="79" y="89" width="44" height="24" rx="1.5" fill="#1d4ed8" fillOpacity="0.28" />
      <path d="M101 120v6M90 126h22" stroke="#e2e8f0" strokeWidth="1.6" strokeLinecap="round" />
      <polyline points="82,107 90,104 97,94 104,108 111,92 119,103" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MacroCatastropheDiagramSvg() {
  return (
    <svg viewBox="0 0 160 160" className="w-32 h-32 mx-auto" fill="none" aria-hidden="true">
      <circle cx="80" cy="80" r="64" stroke="#64748b" strokeWidth="1.25" strokeDasharray="5 4" strokeOpacity="0.6" />
      <circle cx="80" cy="80" r="46" fill="#1e3a8a" fillOpacity="0.18" />

      <circle cx="46" cy="36" r="2" fill="#38bdf8" />
      <circle cx="120" cy="122" r="2.2" fill="#38bdf8" />

      {/* Isometric Capital Reserve Block (top-left) */}
      <polygon points="56,36 74,45 56,54 38,45" fill="#38bdf8" fillOpacity="0.5" stroke="#e2e8f0" strokeWidth="1.4" />
      <polygon points="38,45 56,54 56,74 38,65" fill="#1e40af" fillOpacity="0.55" stroke="#e2e8f0" strokeWidth="1.4" />
      <polygon points="56,54 74,45 74,65 56,74" fill="#0f172a" stroke="#e2e8f0" strokeWidth="1.4" />

      {/* Stability Check Monitor (top-right) */}
      <rect x="82" y="42" width="48" height="32" rx="3" fill="#0f172a" stroke="#e2e8f0" strokeWidth="1.6" />
      <rect x="87" y="47" width="38" height="20" rx="1.5" fill="#1d4ed8" fillOpacity="0.28" />
      <circle cx="106" cy="57" r="7" fill="#2563eb" stroke="#e2e8f0" strokeWidth="1.3" />
      <path d="M103 57l2.2 2.2 4-4.4" stroke="#e2e8f0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M106 74v6M97 80h18" stroke="#e2e8f0" strokeWidth="1.6" strokeLinecap="round" />

      {/* Double-well potential / leverage gauge (bottom) */}
      <rect x="78" y="88" width="12" height="32" rx="6" fill="#0f172a" stroke="#e2e8f0" strokeWidth="1.6" />
      <circle cx="84" cy="120" r="8.5" fill="#2563eb" stroke="#e2e8f0" strokeWidth="1.6" />
      <line x1="84" y1="96" x2="84" y2="118" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />

      {/* Bifurcation wave curves */}
      <path d="M40 94c10 0 12 18 24 18" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M98 95v24M106 95v24M114 95v24" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function DecisionEngineDiagramSvg() {
  return (
    <svg viewBox="0 0 160 160" className="w-32 h-32 mx-auto" fill="none" aria-hidden="true">
      <circle cx="80" cy="80" r="64" stroke="#64748b" strokeWidth="1.25" strokeDasharray="5 4" strokeOpacity="0.6" />
      <circle cx="80" cy="80" r="46" fill="#1e3a8a" fillOpacity="0.18" />

      <circle cx="38" cy="116" r="2.2" fill="#38bdf8" />
      <circle cx="128" cy="70" r="2.2" fill="#38bdf8" />

      {/* Telemetry Monitor (top-left) */}
      <rect x="34" y="42" width="52" height="34" rx="3" fill="#0f172a" stroke="#e2e8f0" strokeWidth="1.6" />
      <rect x="39" y="47" width="42" height="22" rx="1.5" fill="#1d4ed8" fillOpacity="0.28" />
      <path d="M43 63c6-8 12-4 17-9 5-4 10 2 15-5" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M60 76v6M50 82h20" stroke="#e2e8f0" strokeWidth="1.6" strokeLinecap="round" />

      {/* Central Bank / Sovereign Pillars (top-right) */}
      <polygon points="96,60 126,60 121,44 101,44" fill="#2563eb" fillOpacity="0.55" stroke="#e2e8f0" strokeWidth="1.5" />
      <rect x="94" y="60" width="34" height="18" fill="#0f172a" stroke="#e2e8f0" strokeWidth="1.5" />
      <line x1="103" y1="60" x2="103" y2="78" stroke="#38bdf8" strokeWidth="1.5" />
      <line x1="111" y1="60" x2="111" y2="78" stroke="#38bdf8" strokeWidth="1.5" />
      <line x1="119" y1="60" x2="119" y2="78" stroke="#38bdf8" strokeWidth="1.5" />

      {/* Executive Oversight Eye & Stage Nodes (bottom) */}
      <path d="M48 106c9-12 21-17 32-17s23 5 32 17c-9 12-21 17-32 17s-23-5-32-17z" fill="#0f172a" stroke="#e2e8f0" strokeWidth="1.6" />
      <circle cx="80" cy="106" r="8.5" fill="#2563eb" fillOpacity="0.55" stroke="#38bdf8" strokeWidth="1.5" />
      <circle cx="80" cy="106" r="3.5" fill="#e2e8f0" />
    </svg>
  );
}

export default function HeroModelDiagrams({
  activeFilter,
  onSelectFilter,
  onQuickLaunch,
}: HeroModelDiagramsProps) {
  const cards: {
    id: string;
    domain: HeroFilterDomain;
    title: string;
    description: string;
    diagram: React.ReactNode;
    isActionCard?: boolean;
  }[] = [
    {
      id: 'micro',
      domain: 'microstructure',
      title: 'Microstructure Models',
      description: 'Hawkes self-exciting sell cascades, HFT speed throttles, and specialist order-book depth.',
      diagram: <MicrostructureDiagramSvg />,
    },
    {
      id: 'bubble',
      domain: 'assetPrice',
      title: 'Volatility & Bubble Models',
      description: 'GARCH volatility clustering, Hurst herding persistence, and mean-reversion anchors.',
      diagram: <BubbleDiagramSvg />,
    },
    {
      id: 'macro',
      domain: 'macroCycle',
      title: 'Macro Bifurcation Models',
      description: 'Double-well debt-deflation traps, credit leverage ceilings, and central bank easing.',
      diagram: <MacroCatastropheDiagramSvg />,
    },
    {
      id: 'engine',
      domain: 'all',
      title: '5-Stage Command Loop',
      description: 'Weigh asymmetric intel, dry-run gauge directions, and contain crises from T1 to T5.',
      diagram: <DecisionEngineDiagramSvg />,
      isActionCard: true,
    },
  ];

  return (
    <section aria-label="Chaos Model Architecture Overview" className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const isSelected = !card.isActionCard && activeFilter === card.domain;
          return (
            <div
              key={card.id}
              className={`rounded-xl border p-5 flex flex-col justify-between items-center text-center transition-colors ${
                isSelected
                  ? 'bg-[#101c36] border-blue-500/80 shadow-[0_0_24px_rgba(37,99,235,0.18)]'
                  : 'bg-[#0b1120] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="w-full pt-1 pb-3">{card.diagram}</div>

              <div className="space-y-2 max-w-[24ch]">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="pt-4 w-full flex flex-col items-center gap-3">
                {card.isActionCard ? (
                  <button
                    type="button"
                    onClick={onQuickLaunch}
                    className="px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold tracking-wide inline-flex items-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-400"
                  >
                    <span>START SIMULATION</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSelectFilter(isSelected ? 'all' : card.domain)}
                    className={`px-3.5 py-1 rounded-full border text-[11px] font-mono transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-400 ${
                      isSelected
                        ? 'bg-blue-500/15 border-blue-400 text-blue-300 font-semibold'
                        : 'bg-slate-900/70 border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white'
                    }`}
                  >
                    {isSelected ? 'Showing Domain ✓' : 'Filter Cases'}
                  </button>
                )}

                {/* Subtle step indicator dots matching reference */}
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  {[0, 1, 2, 3].map((dotIdx) => (
                    <span
                      key={dotIdx}
                      className={`h-1.5 rounded-full transition-all ${
                        dotIdx === idx ? 'w-3 bg-blue-400' : 'w-1.5 bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
