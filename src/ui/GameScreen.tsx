import { useEffect, useMemo, useRef, useState } from 'react';
import { reportScore } from '@aippy/runtime/leaderboard';
import { Renderer } from '@/art/Renderer';
import { preloadGameAssets } from '@/audio/AssetPreload';
import { haptic } from '@/audio/haptics';
import { useGameAudio } from '@/hooks/useGameAudio';
import { useGameLoop, type GameLoopContext } from '@/hooks/useGameLoop';
import { isRankedConfig } from '@/game/eligibility';
import { computeLayout, Game } from '@/game/Game';
import { sendScorePlaceholder } from '@/game/scoreSend';
import CaptionLayer, { type CaptionEntry } from '@/ui/CaptionLayer';
import GameHUD from '@/ui/GameHUD';
import GhostPortrait from '@/ui/GhostPortrait';
import ResultsScreen from '@/ui/ResultsScreen';
import SettingsPanel from '@/ui/SettingsPanel';
import '@/ui/ui.css';
import type { GameConfig } from '@/config/defaults';
import type { CaptionTone, GameEvent, HudSnapshot, Side } from '@/game/types';

const renderer = new Renderer();

interface GameScreenProps {
  config: GameConfig;
  muted: boolean;
  onToggleMute: () => void;
  onChangeSetting: (key: keyof GameConfig, value: number | string | boolean) => void;
  onResetSettings: () => void;
}

const GameScreen = ({
  config,
  muted,
  onToggleMute,
  onChangeSetting,
  onResetSettings,
}: GameScreenProps) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);
  const lastHud = useRef<HudSnapshot | null>(null);
  const configRef = useRef(config);
  const lastTick = useRef(-1);
  const captionSeq = useRef(0);
  const [size, setSize] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [caption, setCaption] = useState<CaptionEntry | null>(null);
  const [assets, setAssets] = useState({ ready: false, complete: 0, total: 1, failures: 0 });
  const [entered, setEntered] = useState(false);
  const [hud, setHud] = useState<HudSnapshot>({
    phase: 'READY',
    score: 0,
    candy: 0,
    maxCandy: 0,
    multiplier: 1,
    best: 0,
    timeLeft: config.roundDuration,
    meltdown: false,
    hits: 0,
    perfects: 0,
    misses: 0,
    mistakes: 0,
    golden: 0,
    newRecord: false,
    practice: !isRankedConfig(config),
    eligible: true,
  });

  const rankedNow = useMemo(() => isRankedConfig(config), [config]);

  const audioSettings = useMemo(
    () => ({
      muted,
      master: config.masterVolume,
      sfx: config.sfxVolume,
      music: config.musicVolume,
      soundEnabled: config.soundEnabled,
      musicEnabled: config.musicEnabled,
      pitchVariation: config.pitchVariation,
      maxVoices: config.maxAudioVoices,
    }),
    [
      muted,
      config.masterVolume,
      config.sfxVolume,
      config.musicVolume,
      config.soundEnabled,
      config.musicEnabled,
      config.pitchVariation,
      config.maxAudioVoices,
    ],
  );
  const audio = useGameAudio(audioSettings);

  useEffect(() => {
    const controller = new AbortController();
    void preloadGameAssets((complete, total) => setAssets((s) => ({ ...s, complete, total })), controller.signal)
      .then((failures) => { if (!controller.signal.aborted) setAssets((s) => ({ ...s, ready: true, failures: failures.length })); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    configRef.current = config;
    gameRef.current?.setConfig(config);
  }, [config]);

  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;
    const measure = () => {
      const rect = node.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setSize({ w: Math.round(rect.width), h: Math.round(rect.height) });
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    window.addEventListener('orientationchange', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('orientationchange', measure);
    };
  }, []);

  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    gameRef.current?.setPaused(settingsOpen || paused);
  }, [settingsOpen, paused]);

  useEffect(() => {
    if (!caption) return;
    const id = window.setTimeout(
      () => setCaption((c) => (c && c.id === caption.id ? null : c)),
      config.captionDuration * 1000 + 450,
    );
    return () => window.clearTimeout(id);
  }, [caption, config.captionDuration]);

  useEffect(() => {
    const mode = !assets.ready || !entered || settingsOpen || paused || hud.phase === 'RESULTS'
      ? 'off' : hud.phase === 'READY' ? 'menu' : 'game';
    audio.syncMusic(mode);
  }, [hud.phase, settingsOpen, paused, assets.ready, entered, muted, config.musicVolume, config.masterVolume, config.musicEnabled, audio]);

  const handleEvents = (events: GameEvent[]) => {
    const cfg = configRef.current;
    for (const ev of events) {
      switch (ev.type) {
        case 'CANDY_COLLECTED':
          audio.playSfx(ev.perfect ? 'slapPerfect' : 'slapHard', cfg.normalHitVolume);
          audio.playSfx('candyPop', cfg.normalHitVolume);
          if (ev.perfect) audio.playSfx('perfectExtra', cfg.perfectHitVolume);
          haptic(ev.perfect ? 'perfect' : 'hit', cfg.hapticsEnabled, cfg.hapticIntensity);
          if (ev.candy > 0 && ev.candy % 5 === 0) audio.playSfx('comboUp', cfg.comboVolume);
          break;
        case 'JUNK_DEFLECTED':
          audio.playSfx('slapSoft', cfg.normalHitVolume);
          haptic('hit', cfg.hapticsEnabled, cfg.hapticIntensity);
          break;
        case 'PUMPKIN_SMASHED':
          audio.playSfx('goldenHit', cfg.goldenHitVolume);
          haptic('golden', cfg.hapticsEnabled, cfg.hapticIntensity);
          break;
        case 'BABY_HIT':
          audio.playSfx('babyHit', cfg.mistakeVolume);
          audio.playSfx('babyHitExtra', cfg.mistakeVolume);
          haptic('mistake', cfg.hapticsEnabled, cfg.hapticIntensity);
          break;
        case 'BABY_INCOMING':
          audio.playSfx('babyIncoming');
          break;
        case 'BAG_DROPPED':
          audio.playSfx('comboBreak', cfg.comboVolume);
          break;
        case 'BABY_DODGED':
          audio.playSfx('characterReact', 0.5);
          break;
        case 'MISS':
          audio.playSfx('objectMiss', cfg.mistakeVolume);
          break;
        case 'WHIFF':
          audio.playSfx('slapSoft', cfg.normalHitVolume * 0.6);
          break;
        case 'CAPTION':
          captionSeq.current += 1;
          setCaption({ id: captionSeq.current, text: ev.text, tone: ev.tone as CaptionTone });
          break;
        case 'NEW_RECORD':
          audio.playSfx('newRecord');
          haptic('golden', cfg.hapticsEnabled, cfg.hapticIntensity);
          break;
        case 'MELTDOWN':
          audio.playSfx('finalMeltdown');
          haptic('mistake', cfg.hapticsEnabled, cfg.hapticIntensity);
          break;
        case 'RUN_FINISHED':
          // Ranked leaderboard: eligible (default-settings) runs only.
          if (ev.eligible) reportScore(ev.score);
          sendScorePlaceholder({
            runId: ev.runId,
            score: ev.score,
            candy: ev.candy,
            maxCandy: ev.maxCandy,
            hits: ev.hits,
            perfects: ev.perfects,
            misses: ev.misses,
            babyHits: ev.babyHits,
            pumpkins: ev.pumpkins,
            stains: ev.stains,
            eligible: ev.eligible,
            submitted: ev.eligible,
            completedAt: new Date().toISOString(),
          });
          audio.playSfx('scoreReveal');
          audio.stopMusic();
          break;
        default:
          break;
      }
    }
  };

  const update = ({ width, height, deltaTime }: GameLoopContext) => {
    if (!gameRef.current) {
      gameRef.current = new Game(configRef.current, computeLayout(width, height, configRef.current));
    }
    const game = gameRef.current;
    const next = computeLayout(width, height, game.cfg);
    if (
      Math.abs(game.layout.width - next.width) > 0.5 ||
      Math.abs(game.layout.height - next.height) > 0.5 ||
      Math.abs(game.layout.charScale - next.charScale) > 0.002 ||
      Math.abs(game.layout.centerY - next.centerY) > 0.5
    ) {
      game.setLayout(next);
    }
    game.update(deltaTime * 1000);
    handleEvents(game.drainEvents());

    const snap = game.hud;
    if (snap.phase === 'PLAYING' && snap.timeLeft <= 5.02) {
      const secs = Math.ceil(snap.timeLeft);
      if (secs !== lastTick.current && secs > 0) {
        lastTick.current = secs;
        audio.playSfx('countdown', 0.7);
      }
    }

    const prev = lastHud.current;
    if (
      !prev ||
      prev.phase !== snap.phase ||
      prev.score !== snap.score ||
      prev.candy !== snap.candy ||
      prev.best !== snap.best ||
      prev.meltdown !== snap.meltdown ||
      prev.newRecord !== snap.newRecord ||
      prev.practice !== snap.practice ||
      Math.ceil(prev.timeLeft) !== Math.ceil(snap.timeLeft)
    ) {
      lastHud.current = snap;
      setHud(snap);
    }
  };

  const draw = (ctx: CanvasRenderingContext2D, { width, height }: GameLoopContext) => {
    const game = gameRef.current;
    if (!game) return;
    renderer.render(
      ctx,
      {
        width,
        height,
        centerX: game.layout.centerX,
        centerY: game.layout.centerY,
        charScale: game.layout.charScale,
        stretch: game.cfg.armStretch,
        clockMs: game.clock,
        targets: game.list,
        flying: game.physics.list,
        pose: game.motion.current,
        effects: game.effects,
        cfg: game.cfg,
        meltdown: game.meltdownAmount,
        candy: game.candy,
        stains: game.stains,
        costume: game.costume,
        spilledCandy: game.spilledCandy,
        demoSide: game.demoSide,
      },
      null,
    );
  };

  const { canvasRef, getLogicalCoords } = useGameLoop(
    { width: size.w, height: size.h, designWidth: 400, designHeight: 600 },
    update,
    draw,
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (settingsOpen || !assets.ready || !entered) return;
    const game = gameRef.current;
    if (!game) return;
    const point = getLogicalCoords(e);
    if (!point) return;
    const side: Side = point.x < game.layout.centerX ? 'left' : 'right';
    game.tap(side);
  };

  const handleClick = () => {
    audio.syncMusic(settingsOpen || paused ? 'off' : gameRef.current?.phase === 'READY' ? 'menu' : 'game');
  };

  const handleReplay = () => {
    const game = gameRef.current;
    audio.playSfx('uiRestart');
    game?.resetRound();
    lastHud.current = null;
    lastTick.current = -1;
    setCaption(null);
    if (game) setHud(game.hud);
    audio.syncMusic('menu');
  };

  const toggleMute = () => {
    audio.playSfx('uiTap');
    onToggleMute();
  };

  return (
    <div
      ref={wrapRef}
      className="bonk-root relative h-full w-full overflow-hidden"
      style={{ background: config.backgroundColour }}
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full touch-none"
        onPointerDown={handlePointerDown}
        onClick={handleClick}
      />

      {!entered && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-[#170B29] text-center text-[#FFFDD0]" role="status" aria-live="polite">
          <GhostPortrait cfg={config} candy={0} stains={[]} costume="ghost" width={148} height={164} />
          <div className="text-xl font-black uppercase tracking-[0.16em]">Packing the bag</div>
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#E7C790]">
            {assets.ready ? 'The street is ready.' : 'Checking the street and sounds…'}
          </div>
          <div className="h-2 w-48 overflow-hidden rounded-full bg-[#493164]">
            <div className="h-full rounded-full bg-[#FFB247] transition-[width] duration-200" style={{ width: `${Math.round(assets.complete / assets.total * 100)}%` }} />
          </div>
          <div className="text-xs font-black tabular-nums">{assets.complete}/{assets.total}</div>
          {assets.ready && (
            <button type="button" className="bonk-play mt-3 rounded-2xl px-7 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#1B0A2D]" onClick={() => {
              audio.syncMusic('menu');
              setEntered(true);
            }}>Enter the street</button>
          )}
        </div>
      )}
      {entered && assets.failures > 0 && hud.phase === 'READY' && (
        <div className="pointer-events-none absolute inset-x-0 top-[13%] z-20 text-center text-[10px] font-bold text-[#FFE0AF]">
          Some remote sounds are unavailable. You can still play.
        </div>
      )}

      <GameHUD
        score={hud.score}
        best={hud.best}
        timeLeft={hud.timeLeft}
        candy={hud.candy}
        multiplier={hud.multiplier}
        meltdown={hud.meltdown}
        practice={hud.practice}
        muted={muted}
        hidden={hud.phase === 'RESULTS' || settingsOpen}
        textColor={config.uiText}
        accent={config.accentColour}
        hudScale={config.hudScale}
        scoreFontSize={config.scoreFontSize}
        timerFontSize={config.timerFontSize}
        comboFontSize={config.comboFontSize}
        buttonScale={config.buttonScale}
        motionIntensity={config.uiAnimationIntensity}
        onToggleMute={toggleMute}
        onOpenSettings={() => {
          audio.playSfx('uiTap');
          setSettingsOpen(true);
        }}
      />

      <CaptionLayer
        caption={hud.phase === 'PLAYING' || hud.phase === 'READY' ? caption : null}
        duration={config.captionDuration}
        intensity={config.uiAnimationIntensity}
        accent={config.accentColour}
      />

      {hud.phase === 'READY' && !settingsOpen && (
        <div className="pointer-events-none absolute inset-x-0 bottom-[7%] z-20 flex flex-col items-center gap-1">
          <div className="bonk-pulse rounded-full bg-black/50 px-4 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-[#FFFDD0]">
            Tap to start
          </div>
          <div className="rounded-full bg-black/40 px-3 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-[#FFD6A0]">
            Candy in the bag. Junk stays out. Babies are off limits.
          </div>
          <div className="flex w-full items-center justify-between px-4">
            <span className="bonk-hint text-[10px] font-black uppercase tracking-[0.18em] text-[#FFD6A0]">
              ◀ Tap left
            </span>
            <span className="bonk-hint text-[10px] font-black uppercase tracking-[0.18em] text-[#FFD700]">
              Tap right ▶
            </span>
          </div>
        </div>
      )}

      {hud.phase === 'RESULTS' && (
        <ResultsScreen
          score={hud.score}
          best={hud.best}
          candy={hud.candy}
          maxCandy={hud.maxCandy}
          hits={hud.hits}
          perfects={hud.perfects}
          golden={hud.golden}
          misses={hud.misses}
          isNewBest={hud.newRecord}
          practice={hud.practice}
          stains={gameRef.current?.stains ?? []}
          costume={gameRef.current?.costume ?? 'ghost'}
          cfg={config}
          textColor={config.uiText}
          speed={config.resultAnimationSpeed}
          buttonScale={config.buttonScale}
          onReplay={handleReplay}
        />
      )}

      {settingsOpen && (
        <SettingsPanel
          config={config}
          muted={muted}
          ranked={rankedNow}
          onToggleMute={toggleMute}
          onChange={onChangeSetting}
          onResetAll={onResetSettings}
          onClose={() => {
            audio.playSfx('uiBack');
            setSettingsOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default GameScreen;
