import { useEffect, useMemo, useRef, useState } from 'react';
import { RotateCcw, X } from 'lucide-react';
import DevUnlockOverlay from '@/components/DevUnlockOverlay';
import {
  CONTROLS,
  GROUP_LABELS,
  GROUP_ORDER,
  controlsForGroup,
  type ControlDef,
  type ControlGroup,
} from '@/config/tweakSchema';
import type { GameConfig } from '@/config/defaults';
import '@/ui/ui.css';

interface SettingsPanelProps {
  config: GameConfig;
  muted: boolean;
  /** false → the effective settings are non-default, so runs are practice. */
  ranked: boolean;
  onToggleMute: () => void;
  onChange: (key: keyof GameConfig, value: number | string | boolean) => void;
  onResetAll: () => void;
  onClose: () => void;
}

function formatValue(def: ControlDef, value: number): string {
  if (def.step >= 1) return String(Math.round(value));
  if (def.step >= 0.05) return value.toFixed(2);
  return value.toFixed(3);
}

const ControlRow = ({
  def,
  value,
  onChange,
}: {
  def: ControlDef;
  value: number | string | boolean;
  onChange: (key: keyof GameConfig, value: number | string | boolean) => void;
}) => {
  if (def.kind === 'boolean') {
    const on = Boolean(value);
    return (
      <div className="flex items-center justify-between gap-2 py-2">
        <div className="min-w-0">
          <div className="text-[12px] font-bold leading-snug text-[#D9CCEA]">{def.label}</div>
          <div className="text-[9px] leading-snug text-[#8F7BB0]">{def.help}</div>
        </div>
        <button
          type="button"
          onClick={() => onChange(def.key, !on)}
          className="relative h-7 w-12 shrink-0 rounded-full transition-colors"
          style={{
            background: on ? '#6FE081' : 'rgba(255,255,255,0.16)',
            border: '2px solid #2E0854',
          }}
          aria-pressed={on}
          aria-label={def.label}
        >
          <span
            className="absolute top-0.5 h-5 w-5 rounded-full bg-[#FFFDD0] transition-all"
            style={{ left: on ? 22 : 2, border: '2px solid #2E0854' }}
          />
        </button>
      </div>
    );
  }

  if (def.kind === 'color') {
    return (
      <div className="flex items-center justify-between gap-2 py-2">
        <div className="min-w-0">
          <div className="text-[12px] font-bold leading-snug text-[#D9CCEA]">{def.label}</div>
          <div className="text-[9px] leading-snug text-[#8F7BB0]">{def.help}</div>
        </div>
        <input
          type="color"
          value={String(value)}
          onChange={(e) => onChange(def.key, e.target.value)}
          className="h-8 w-12 shrink-0 rounded-md border-2 border-[#2E0854] bg-transparent p-0"
          aria-label={def.label}
        />
      </div>
    );
  }

  const num = Number(value);
  return (
    <div className="py-1.5">
      <div className="flex items-start justify-between gap-2">
        <span className="min-w-0 text-[12px] font-bold leading-snug text-[#D9CCEA]">{def.label}</span>
        <span className="shrink-0 text-[11px] font-black tabular-nums text-[#98FF98]">
          {formatValue(def, num)}
        </span>
      </div>
      <input
        type="range"
        className="bonk-range"
        min={def.min}
        max={def.max}
        step={def.step}
        value={num}
        onChange={(e) => onChange(def.key, Number(e.target.value))}
        aria-label={def.label}
      />
    </div>
  );
};

const SettingsPanel = ({
  config,
  muted,
  ranked,
  onToggleMute,
  onChange,
  onResetAll,
  onClose,
}: SettingsPanelProps) => {
  const [group, setGroup] = useState<ControlGroup>('gameplay');
  const [query, setQuery] = useState('');
  const [restored, setRestored] = useState(false);
  const secretTapTimesRef = useRef<number[]>([]);
  const [devAccessOpen, setDevAccessOpen] = useState(false);

  useEffect(() => () => {
    secretTapTimesRef.current = [];
  }, []);

  const handleSettingsTitlePress = (event: React.PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const now = performance.now();

    secretTapTimesRef.current = [
      ...secretTapTimesRef.current.filter((time) => now - time <= 8000),
      now,
    ].slice(-10);

    if (secretTapTimesRef.current.length >= 10) {
      secretTapTimesRef.current = [];
      setDevAccessOpen(true);
    }
  };

  const handleClose = () => {
    secretTapTimesRef.current = [];
    setDevAccessOpen(false);
    onClose();
  };

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length > 0) {
      return CONTROLS.filter(
        (c) => c.label.toLowerCase().includes(q) || c.help.toLowerCase().includes(q),
      );
    }
    return controlsForGroup(group);
  }, [group, query]);

  return (
    <div
      className="absolute inset-0 z-40 flex items-end"
      style={{ background: 'rgba(7,1,16,0.84)' }}
    >
      <div
        className="bonk-hud-panel flex max-h-[90%] w-full flex-col rounded-t-[26px]"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)' }}
      >
        <div className="flex items-center justify-between px-4 pb-2 pt-3">
          <div>
            <div
              className="text-base font-black uppercase tracking-[0.14em] text-white"
              onPointerDown={handleSettingsTitlePress}
            >
              Tuning
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9C88BD]">
              {CONTROLS.length} live controls · round paused
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close settings"
            className="bonk-btn flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: 'linear-gradient(180deg,#3b1566,#240a42)' }}
          >
            <X size={20} color="#FFFDD0" strokeWidth={3} />
          </button>
        </div>

        <div className="mx-4 mb-2 rounded-xl px-2.5 py-1.5 text-[9px] font-bold uppercase leading-snug tracking-[0.04em]"
          style={{
            border: `1px solid ${ranked ? 'rgba(111,224,129,0.45)' : 'rgba(255,154,60,0.55)'}`,
            background: ranked ? 'rgba(111,224,129,0.1)' : 'rgba(255,154,60,0.12)',
            color: ranked ? '#A8FFB8' : '#FFC48A',
          }}
        >
          {restored && ranked
            ? 'Defaults restored — next run can submit.'
            : ranked
              ? 'Default settings · your next run can submit to the leaderboard.'
              : 'Custom settings: practice run. High scores submit only on defaults.'}
        </div>

        <div className="flex items-center gap-2 px-4 pb-2">
          <button
            type="button"
            onClick={onToggleMute}
            className="bonk-btn flex items-center gap-2 rounded-xl px-3 py-1.5"
            style={{ background: 'rgba(255,255,255,0.07)' }}
          >
            <span className="text-[11px] font-bold text-[#D9CCEA]">Sound</span>
            <span className="text-[11px] font-black text-[#98FF98]">{muted ? 'Off' : 'On'}</span>
          </button>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="min-w-0 flex-1 rounded-xl border border-[#3b1566] bg-black/30 px-3 py-1.5 text-[12px] font-bold text-[#D9CCEA] outline-none placeholder:text-[#6B5A88]"
            aria-label="Search controls"
          />
        </div>

        <div className="bonk-tabs flex shrink-0 gap-1.5 overflow-x-auto px-4 pb-2">
          {GROUP_ORDER.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => {
                setGroup(g);
                setQuery('');
              }}
              className="shrink-0 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em]"
              style={{
                background: group === g && query.length === 0 ? '#6FE081' : 'rgba(255,255,255,0.09)',
                color: group === g && query.length === 0 ? '#170528' : '#B7A6D6',
                border: '2px solid #2E0854',
              }}
            >
              {GROUP_LABELS[g]}
            </button>
          ))}
        </div>

        <div className="bonk-scroll min-h-0 flex-1 px-4 pb-2">
          <div className="rounded-xl bg-black/20 px-3">
            {list.length === 0 && (
              <div className="py-6 text-center text-[11px] font-bold text-[#8F7BB0]">
                No matching controls
              </div>
            )}
            {list.map((def) => (
              <ControlRow key={String(def.key)} def={def} value={config[def.key]} onChange={onChange} />
            ))}
          </div>
        </div>

        <div className="flex gap-2 px-4 pt-1">
          <button
            type="button"
            onClick={() => {
              onResetAll();
              setRestored(true);
            }}
            className="bonk-btn flex items-center justify-center gap-1.5 rounded-xl px-3 py-3 text-[11px] font-black uppercase tracking-wider"
            style={{ background: 'linear-gradient(180deg,#4a2478,#2a0e4d)', color: '#D9CCEA' }}
          >
            <RotateCcw size={13} strokeWidth={3} />
            Reset all
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="bonk-play flex-1 rounded-xl py-3 text-[13px] font-black uppercase tracking-wider"
            style={{ color: '#170528', border: '3px solid #2E0854' }}
          >
            Done
          </button>
        </div>
      </div>

      {devAccessOpen && <DevUnlockOverlay onClose={() => setDevAccessOpen(false)} />}
    </div>
  );
};

export default SettingsPanel;