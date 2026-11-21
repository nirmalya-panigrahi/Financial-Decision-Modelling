import React from 'react';
import {
  Activity,
  Droplets,
  Scale,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import {
  GaugeKey,
  ScenarioDomain,
  ScenarioTheme,
} from '../types';

export function CrisisLogoSvg({ accent = '#10b981', size = 28 }: { accent?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect x="2" y="2" width="32" height="32" rx="6" stroke={accent} strokeWidth="1.75" strokeOpacity="0.85" />
      <path
        d="M7 23C10 13 15 11 18 18C21 25 26 23 29 13"
        stroke={accent}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="11" y1="9" x2="11" y2="27" stroke="currentColor" strokeOpacity="0.28" strokeWidth="1.2" />
      <line x1="18" y1="8" x2="18" y2="28" stroke="currentColor" strokeOpacity="0.28" strokeWidth="1.2" />
      <line x1="25" y1="9" x2="25" y2="27" stroke="currentColor" strokeOpacity="0.28" strokeWidth="1.2" />
      <circle cx="18" cy="18" r="2.2" fill={accent} />
    </svg>
  );
}

function EurozoneStarsSvg({ color }: { color: string }) {
  const stars = Array.from({ length: 12 }, (_, idx) => {
    const angle = (idx * 30 - 90) * (Math.PI / 180);
    const cx = 18 + Math.cos(angle) * 13;
    const cy = 18 + Math.sin(angle) * 13;
    return { cx, cy };
  });

  return (
    <svg width="32" height="32" viewBox="0 0 36 36" fill="none" aria-hidden="true" className="shrink-0">
      {stars.map((s, i) => (
        <circle key={i} cx={s.cx} cy={s.cy} r="1.45" fill={color} />
      ))}
    </svg>
  );
}

export function ThemeHeaderChrome({ theme }: { theme: ScenarioTheme }) {
  const c = theme.colors;
  if (theme.headerChrome === 'command') return null;

  if (theme.headerChrome === 'newsprint') {
    return (
      <div
        className="w-full px-4 py-2 border-b-2 flex items-center justify-between gap-4 text-xs"
        style={{
          backgroundColor: c.surface,
          borderColor: c.border,
          color: c.text,
          fontFamily: theme.fonts.heading,
        }}
      >
        <span className="tracking-widest font-bold uppercase whitespace-nowrap">
          {theme.labels.mastheadTitle}
        </span>
        <span className="hidden sm:inline text-[11px] italic" style={{ color: c.muted, fontFamily: theme.fonts.body }}>
          Extra Financial Wire Edition — Clearinghouse &amp; Treasury Dispatches
        </span>
        <span className="text-[11px] font-bold uppercase whitespace-nowrap" style={{ color: c.accent, fontFamily: theme.fonts.mono }}>
          {theme.labels.mastheadCode}
        </span>
      </div>
    );
  }

  if (theme.headerChrome === 'crt') {
    return (
      <div
        className="w-full px-4 py-1.5 border-b flex items-center justify-between gap-4 text-xs"
        style={{
          backgroundColor: c.surfaceAlt,
          borderColor: c.border,
          color: c.text,
          fontFamily: theme.fonts.mono,
        }}
      >
        <span className="font-bold tracking-wider whitespace-nowrap">
          +-[ {theme.labels.mastheadTitle} ]-+
        </span>
        <span className="hidden sm:inline text-[11px]" style={{ color: c.muted }}>
          {theme.labels.mastheadCode}
        </span>
        <span className="text-[11px] font-bold whitespace-nowrap" style={{ color: c.accent }}>
          MEM: 640K OK
        </span>
      </div>
    );
  }

  if (theme.headerChrome === 'terminal2008') {
    return (
      <div
        className="w-full px-4 py-1.5 border-b flex items-center justify-between gap-4 text-[11px]"
        style={{
          backgroundColor: c.accent,
          borderColor: c.border,
          color: c.accentText,
          fontFamily: theme.fonts.mono,
        }}
      >
        <span className="font-bold tracking-wider uppercase whitespace-nowrap">
          {theme.labels.mastheadTitle}
        </span>
        <span className="hidden sm:inline font-semibold">
          ALERT // INTERBANK REPO &amp; CREDIT WATCH
        </span>
        <span className="font-bold whitespace-nowrap">{theme.labels.mastheadCode}</span>
      </div>
    );
  }

  if (theme.headerChrome === 'hft2010') {
    return (
      <div
        className="w-full px-4 py-1.5 border-b flex items-center justify-between gap-4 text-[11px]"
        style={{
          backgroundColor: c.surfaceAlt,
          borderColor: c.border,
          color: c.text,
          fontFamily: theme.fonts.mono,
        }}
      >
        <span className="font-bold tracking-wider whitespace-nowrap" style={{ color: c.accent }}>
          {theme.labels.mastheadTitle}
        </span>
        <span className="hidden sm:inline tabular-nums" style={{ color: c.muted }}>
          MATCH-ENGINE: NYSE-ARCA/FUTURES CROSS-LINK
        </span>
        <span className="tabular-nums font-semibold whitespace-nowrap" style={{ color: '#e879f9' }}>
          {theme.labels.mastheadCode}
        </span>
      </div>
    );
  }

  if (theme.headerChrome === 'eurozone') {
    return (
      <div
        className="w-full px-4 py-2 border-b flex items-center justify-between gap-4"
        style={{
          backgroundColor: c.surface,
          borderColor: c.border,
          color: c.text,
        }}
      >
        <div className="flex items-center gap-2.5">
          <EurozoneStarsSvg color="#b48216" />
          <span className="text-xs font-semibold tracking-wide" style={{ fontFamily: theme.fonts.heading }}>
            {theme.labels.mastheadTitle}
          </span>
        </div>
        <span className="text-[11px] font-mono hidden sm:inline" style={{ color: c.muted }}>
          {theme.labels.mastheadCode}
        </span>
      </div>
    );
  }

  if (theme.headerChrome === 'win98') {
    return (
      <div
        className="w-full px-3 py-1 flex items-center justify-between gap-4 text-xs font-bold text-white"
        style={{
          background: 'linear-gradient(90deg, #000080 0%, #1084d0 100%)',
          fontFamily: theme.fonts.heading,
        }}
      >
        <span className="whitespace-nowrap truncate">{theme.labels.mastheadTitle}</span>
        <span className="text-[11px] font-normal hidden sm:inline">{theme.labels.mastheadCode}</span>
      </div>
    );
  }

  if (theme.headerChrome === 'fanfold') {
    return (
      <div
        className="w-full px-4 py-1.5 border-b border-dashed flex items-center justify-between gap-4 text-[11px]"
        style={{
          backgroundColor: c.surfaceAlt,
          borderColor: c.border,
          color: c.text,
          fontFamily: theme.fonts.mono,
        }}
      >
        <span className="font-bold whitespace-nowrap">:: {theme.labels.mastheadTitle} ::</span>
        <span className="hidden sm:inline" style={{ color: c.muted }}>{theme.labels.mastheadCode}</span>
      </div>
    );
  }

  if (theme.headerChrome === 'brutalist') {
    return (
      <div
        className="w-full px-4 py-2 border-b-2 flex items-center justify-between gap-4 text-xs font-bold tracking-tight"
        style={{
          backgroundColor: c.surface,
          borderColor: c.border,
          color: c.text,
          fontFamily: theme.fonts.heading,
        }}
      >
        <span className="uppercase">{theme.labels.mastheadTitle}</span>
        <span className="font-mono text-[11px]" style={{ color: c.accent }}>{theme.labels.mastheadCode}</span>
      </div>
    );
  }

  // Fintech 2021
  return (
    <div
      className="w-full px-4 py-1.5 border-b flex items-center justify-between gap-4 text-[11px]"
      style={{
        backgroundColor: c.surfaceAlt,
        borderColor: c.border,
        color: c.muted,
        fontFamily: theme.fonts.mono,
      }}
    >
      <span className="font-semibold" style={{ color: c.text }}>{theme.labels.mastheadTitle}</span>
      <span className="hidden sm:inline">{theme.labels.mastheadCode}</span>
    </div>
  );
}

const GAUGE_ICONS: Record<GaugeKey, React.ComponentType<{ className?: string }>> = {
  liquidity: Droplets,
  confidence: TrendingUp,
  stability: ShieldCheck,
  regulatory: Scale,
};

export function ThemedGaugeCard({
  gaugeKey,
  label,
  value,
  theme,
  index,
}: {
  gaugeKey: GaugeKey;
  label: string;
  value: number;
  theme: ScenarioTheme;
  index: number;
}) {
  const Icon = GAUGE_ICONS[gaugeKey];
  const c = theme.colors;
  const statusColor = value >= 65 ? c.good : value >= 42 ? c.warn : c.bad;
  const statusText = value >= 65 ? 'Healthy' : value >= 42 ? 'Strained' : 'Critical';

  // Eurozone sovereign bond-spread readout in bps
  const bpsEquivalent = Math.max(40, Math.round((100 - value) * 8.5 + 45));

  const cardStyle: React.CSSProperties = {
    backgroundColor: c.surface,
    borderColor: c.border,
    borderRadius: theme.radius,
    borderStyle: theme.borderStyle,
    boxShadow: theme.shadowStyle,
    color: c.text,
    fontFamily: theme.fonts.body,
  };

  return (
    <div
      className={`border p-3.5 flex flex-col justify-between gap-2.5 ${theme.id === 'win98_1998' ? 'win98-bevel-out border-0' : ''} ${theme.id === 'brutalist2034' ? 'border-2' : ''}`}
      style={cardStyle}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="p-1.5 shrink-0 flex items-center justify-center"
            style={{
              backgroundColor: c.surfaceAlt,
              color: statusColor,
              borderRadius: theme.radius,
              border: `1px solid ${c.border}`,
            }}
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <span
              className="text-xs font-semibold block truncate"
              style={{ fontFamily: theme.fonts.heading }}
              title={label}
            >
              {label}
            </span>
            <span className="text-[11px] block" style={{ color: c.muted, fontFamily: theme.fonts.mono }}>
              {statusText}
            </span>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span
            className="text-sm font-bold tabular-nums px-1.5 py-0.5 border inline-block"
            style={{
              fontFamily: theme.fonts.mono,
              color: statusColor,
              backgroundColor: c.surfaceAlt,
              borderColor: c.border,
              borderRadius: theme.radius,
            }}
          >
            {value}%
          </span>
          {theme.id === 'eurozone2011' && (
            <span className="block text-[10px] tabular-nums mt-0.5" style={{ color: c.muted, fontFamily: theme.fonts.mono }}>
              +{bpsEquivalent} bps
            </span>
          )}
        </div>
      </div>

      {/* Gauge Visualizer Variants */}
      {theme.gaugeStyle === 'needle' ? (
        <div className="flex items-center gap-3 pt-1">
          <svg viewBox="0 0 80 44" className="w-16 h-9 shrink-0" aria-hidden="true">
            <path d="M 8 38 A 32 32 0 0 1 72 38" fill="none" stroke={c.border} strokeWidth="5" strokeOpacity="0.3" />
            <path
              d="M 8 38 A 32 32 0 0 1 72 38"
              fill="none"
              stroke={statusColor}
              strokeWidth="5"
              strokeDasharray={`${(value / 100) * 100.5} 100.5`}
            />
            {(() => {
              const rad = ((180 - (value / 100) * 180) * Math.PI) / 180;
              const nx = 40 + Math.cos(rad) * 24;
              const ny = 38 - Math.sin(rad) * 24;
              return <line x1="40" y1="38" x2={nx} y2={ny} stroke={c.text} strokeWidth="2" strokeLinecap="round" />;
            })()}
            <circle cx="40" cy="38" r="3" fill={c.accent} />
          </svg>
          <div className="flex-1 text-[11px] tabular-nums border-t pt-1" style={{ borderColor: c.border, color: c.muted, fontFamily: theme.fonts.mono }}>
            LEDGER COL #{index + 1}: {value}/100
          </div>
        </div>
      ) : theme.gaugeStyle === 'segment' ? (
        <div className="flex items-center gap-1 pt-0.5" aria-hidden="true">
          {Array.from({ length: 10 }, (_, segIdx) => {
            const filled = value >= (segIdx + 1) * 10 - 4;
            return (
              <div
                key={segIdx}
                className="h-2.5 flex-1 border"
                style={{
                  borderColor: c.border,
                  backgroundColor: filled ? (theme.id === 'win98_1998' ? c.accent : statusColor) : c.surfaceAlt,
                }}
              />
            );
          })}
        </div>
      ) : theme.gaugeStyle === 'led' ? (
        <div className="flex items-center gap-0.5 pt-0.5" aria-hidden="true">
          {Array.from({ length: 16 }, (_, segIdx) => {
            const filled = value >= (segIdx + 1) * 6.25 - 3;
            return (
              <div
                key={segIdx}
                className="h-1.5 flex-1 rounded-xs"
                style={{
                  backgroundColor: filled ? statusColor : c.surfaceAlt,
                  opacity: filled ? 1 : 0.45,
                }}
              />
            );
          })}
        </div>
      ) : theme.gaugeStyle === 'ledger' ? (
        <div className="space-y-1 pt-0.5">
          <div className="w-full h-2 border overflow-hidden" style={{ borderColor: c.border, backgroundColor: c.surfaceAlt }}>
            <div className="h-full transition-all duration-200" style={{ width: `${value}%`, backgroundColor: statusColor }} />
          </div>
          <div className="flex justify-between text-[10px] tabular-nums" style={{ color: c.muted, fontFamily: theme.fonts.mono }}>
            <span>000</span>
            <span>COL-0{index + 1}</span>
            <span>100</span>
          </div>
        </div>
      ) : (
        /* Default bar + 2008 sparkline */
        <div className="space-y-1.5">
          <div
            className="w-full h-2 overflow-hidden"
            style={{
              backgroundColor: c.surfaceAlt,
              borderRadius: theme.radius,
              border: `1px solid ${c.border}`,
            }}
          >
            <div
              className="h-full transition-all duration-200"
              style={{
                width: `${value}%`,
                backgroundColor: statusColor,
                borderRadius: theme.radius,
              }}
            />
          </div>
          {theme.id === 'terminal2008' && (
            <div className="flex items-center justify-between text-[10px] tabular-nums" style={{ color: c.muted, fontFamily: theme.fonts.mono }}>
              <span>DESK METRIC #{index + 1}</span>
              <span style={{ color: statusColor }}>{value >= 50 ? 'PASSING' : 'WATCH'}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function MarketTelemetryChart({
  domain,
  simData,
  revealedCount,
  totalStagesCompleted,
  theme,
}: {
  domain: ScenarioDomain;
  simData: any[];
  revealedCount: number;
  totalStagesCompleted: number;
  theme: ScenarioTheme;
}) {
  const c = theme.colors;
  const visibleSlice = simData.slice(0, Math.max(2, revealedCount));
  const values = visibleSlice.map((d) =>
    domain === 'microstructure' ? d.price : domain === 'assetPrice' ? d.chPrice : d.chGDP
  );
  const allValues = simData.map((d) =>
    domain === 'microstructure' ? d.price : domain === 'assetPrice' ? d.chPrice : d.chGDP
  );

  const minV = (allValues.length ? Math.min(...allValues) : 80) * 0.97;
  const maxV = (allValues.length ? Math.max(...allValues) : 120) * 1.03;
  const range = maxV - minV || 1;

  const W = 440;
  const H = 150;
  const pad = 16;

  const toX = (idx: number) =>
    pad + (idx / Math.max(1, simData.length - 1)) * (W - pad * 2);
  const toY = (val: number) =>
    H - pad - ((val - minV) / range) * (H - pad * 2);

  const points = values.map((v, i) => `${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ');
  const lastX = values.length ? toX(values.length - 1) : pad;
  const lastY = values.length ? toY(values[values.length - 1]) : H / 2;
  const latestVal = values.length ? values[values.length - 1] : 100;

  const metricLabel =
    domain === 'microstructure' ? 'Index Price' : domain === 'assetPrice' ? 'Asset Price' : 'Output GDP';

  const chartBg =
    theme.chartStyle === 'pen-plotter'
      ? '#f9fbf6'
      : theme.chartStyle === 'ticker-tape'
      ? '#efe6ce'
      : theme.id === 'win98_1998'
      ? '#ffffff'
      : c.bg;

  const strokeColor =
    theme.chartStyle === 'phosphor'
      ? '#4ade80'
      : theme.chartStyle === 'pen-plotter'
      ? '#b91c1c'
      : theme.chartStyle === 'ticker-tape'
      ? '#1a1612'
      : c.accent;

  return (
    <section
      className={`border p-4 space-y-3 ${theme.id === 'win98_1998' ? 'win98-bevel-out border-0' : ''} ${theme.id === 'brutalist2034' ? 'border-2' : ''}`}
      style={{
        backgroundColor: c.surface,
        borderColor: c.border,
        borderRadius: theme.radius,
        borderStyle: theme.borderStyle,
        boxShadow: theme.shadowStyle,
        color: c.text,
      }}
    >
      <div className="flex items-center justify-between gap-2 pb-2 border-b" style={{ borderColor: c.border }}>
        <div className="flex items-center gap-2 min-w-0">
          <Activity className="h-4 w-4 shrink-0" style={{ color: c.accent }} />
          <h3 className="text-xs font-bold truncate" style={{ fontFamily: theme.fonts.heading }}>
            {theme.labels.panelTitles.telemetry}
          </h3>
        </div>
        <span className="text-[11px] tabular-nums shrink-0" style={{ color: c.muted, fontFamily: theme.fonts.mono }}>
          {totalStagesCompleted}/5 Intervals · {metricLabel}: {latestVal.toFixed(1)}
        </span>
      </div>

      <div
        className={`relative border overflow-hidden ${theme.id === 'win98_1998' ? 'win98-bevel-in border-0' : ''}`}
        style={{
          backgroundColor: chartBg,
          borderColor: c.border,
          borderRadius: theme.radius,
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-36 block" role="img" aria-label="Market telemetry trajectory chart">
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((frac, i) => {
            const y = pad + frac * (H - pad * 2);
            return (
              <line
                key={i}
                x1={pad}
                y1={y}
                x2={W - pad}
                y2={y}
                stroke={theme.chartStyle === 'pen-plotter' ? '#b8d0b4' : c.border}
                strokeOpacity={theme.chartStyle === 'pen-plotter' ? 0.8 : 0.45}
                strokeWidth="1"
                strokeDasharray={theme.chartStyle === 'phosphor' ? '2 3' : undefined}
              />
            );
          })}

          {/* Ticker-tape sprocket holes */}
          {theme.chartStyle === 'ticker-tape' &&
            Array.from({ length: 18 }, (_, i) => (
              <circle key={i} cx={20 + i * 23} cy={8} r="2" fill={c.border} fillOpacity="0.25" />
            ))}

          {/* Eurozone sovereign spread corridor band */}
          {theme.id === 'eurozone2011' && (
            <rect
              x={pad}
              y={toY(112)}
              width={W - pad * 2}
              height={Math.max(12, Math.abs(toY(92) - toY(112)))}
              fill={c.accent}
              fillOpacity="0.08"
            />
          )}

          {/* HFT Order-Book Depth Bars (subtle background histogram) */}
          {theme.id === 'hft2010' &&
            visibleSlice
              .filter((_, i) => i % 4 === 0)
              .map((pt, i) => {
                const origIdx = i * 4;
                const depthRatio = Math.min(1, (pt.bidDepth || 40) / 100);
                const bh = depthRatio * 34;
                return (
                  <rect
                    key={origIdx}
                    x={toX(origIdx) - 1.5}
                    y={H - pad - bh}
                    width="3"
                    height={bh}
                    fill="#e879f9"
                    fillOpacity="0.22"
                  />
                );
              })}

          {/* Candlestick mode for 2008/2010 */}
          {theme.chartStyle === 'candles' &&
            values.length > 4 &&
            values
              .filter((_, i) => i % Math.max(1, Math.floor(values.length / 26)) === 0)
              .map((val, idx, arr) => {
                const prev = idx > 0 ? arr[idx - 1] : val;
                const stepIdx = Math.min(values.length - 1, idx * Math.max(1, Math.floor(values.length / 26)));
                const x = toX(stepIdx);
                const y1 = toY(prev);
                const y2 = toY(val);
                const top = Math.min(y1, y2);
                const height = Math.max(3, Math.abs(y2 - y1));
                const up = val >= prev;
                return (
                  <rect
                    key={idx}
                    x={x - 2.5}
                    y={top}
                    width="5"
                    height={height}
                    fill={up ? c.good : c.bad}
                    fillOpacity="0.75"
                  />
                );
              })}

          {/* Main Trajectory Line */}
          {values.length > 1 && (
            <polyline
              fill="none"
              stroke={strokeColor}
              strokeWidth={theme.chartStyle === 'pen-plotter' ? '1.8' : '2.4'}
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          )}

          {/* Current head marker */}
          {values.length > 0 && (
            <circle cx={lastX} cy={lastY} r="3.5" fill={strokeColor} />
          )}
        </svg>

        <div
          className="px-3 py-1.5 border-t flex items-center justify-between text-[10px] tabular-nums"
          style={{ borderColor: c.border, color: c.muted, fontFamily: theme.fonts.mono }}
        >
          <span>T0 START</span>
          <span>RANGE [{minV.toFixed(1)} .. {maxV.toFixed(1)}]</span>
          <span>T5 HORIZON</span>
        </div>
      </div>
    </section>
  );
}
