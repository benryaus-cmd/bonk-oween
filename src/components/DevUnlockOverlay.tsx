import { lazy, Suspense, useState } from 'react';

const ProjectFileViewer = lazy(() => import('@/components/ProjectFileViewer'));

interface DevUnlockOverlayProps {
  onClose: () => void;
}

const DevUnlockOverlay = ({ onClose }: DevUnlockOverlayProps) => {
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [unlocked, setUnlocked] = useState(false);

  if (unlocked) {
    return (
      <Suspense
        fallback={
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#08040F] font-mono text-[12px] uppercase tracking-[0.2em] text-slate-400">
            Loading files…
          </div>
        }
      >
        <ProjectFileViewer onClose={onClose} />
      </Suspense>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center px-5"
      style={{ background: 'rgba(4,1,10,0.96)' }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-[#100722] p-4">
        <div className="text-center text-[12px] font-black uppercase tracking-[0.22em] text-slate-200">
          Developer access
        </div>
        <input
          type="password"
          value={password}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          onChange={(e) => {
            setPassword(e.target.value);
            setPasswordError('');
          }}
          className="mt-3 w-full rounded-lg border border-white/15 bg-black/60 px-3 py-2.5 font-mono text-[14px] text-slate-100 outline-none"
          aria-label="Developer password"
        />
        {passwordError && (
          <div className="mt-2 font-mono text-[11px] font-bold text-[#FF6B6B]">{passwordError}</div>
        )}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-white/20 py-2.5 text-[11px] font-black uppercase tracking-wider text-slate-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (password === 'gg') {
                setUnlocked(true);
                return;
              }
              setPassword('');
              setPasswordError('Incorrect password');
            }}
            className="flex-1 rounded-lg py-2.5 text-[11px] font-black uppercase tracking-wider"
            style={{ background: '#6FE081', color: '#0B0616' }}
          >
            Unlock
          </button>
        </div>
      </div>
    </div>
  );
};

export default DevUnlockOverlay;