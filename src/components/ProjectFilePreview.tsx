import { useState } from 'react';
import type { ProjectFileEntry } from '@/types/projectFiles';
import { copyText, decodeContent, formatSize } from '@/dev/projectFileDiscovery';

interface ProjectFilePreviewProps {
  file: ProjectFileEntry;
  onBack: () => void;
}

const ProjectFilePreview = ({ file, onBack }: ProjectFilePreviewProps) => {
  const [toast, setToast] = useState('');
  const content = decodeContent(file);

  const flash = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast((current) => (current === message ? '' : current)), 1200);
  };

  const handleCopyFile = async () => {
    const ok = await copyText(content);
    flash(ok ? 'FILE ✓' : 'COPY FAILED');
  };

  const handleCopyPath = async () => {
    const ok = await copyText(file.path);
    flash(ok ? 'PATH ✓' : 'COPY FAILED');
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col"
      style={{ background: '#08040F' }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div
        className="flex items-center gap-2 border-b border-white/10 px-3 py-2"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8px)' }}
      >
        <button
          type="button"
          onClick={onBack}
          className="shrink-0 rounded-lg border border-white/20 px-2.5 py-1.5 text-[11px] font-black uppercase tracking-wider text-slate-200"
        >
          ← Back
        </button>
        <div className="min-w-0 flex-1 truncate font-mono text-[11px] text-slate-200">{file.path}</div>
        <button
          type="button"
          onClick={handleCopyFile}
          className="shrink-0 rounded-lg px-2 py-1.5 text-[10px] font-black uppercase tracking-wider"
          style={{ background: '#6FE081', color: '#0B0616' }}
        >
          Copy file
        </button>
        <button
          type="button"
          onClick={handleCopyPath}
          className="shrink-0 rounded-lg border border-white/20 px-2 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-200"
        >
          Copy path
        </button>
      </div>

      <div className="border-b border-white/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-slate-400">
        STATUS: {file.status} · SIZE: {formatSize(file.size)}
        {file.error ? ` · ${file.error}` : ''}
      </div>

      <div className="min-h-0 flex-1 overflow-auto overscroll-contain px-3 py-2">
        <pre
          className="w-max min-w-full font-mono text-[11px] leading-[1.5] text-[#CBD5E1]"
          style={{ whiteSpace: 'pre' }}
        >
          {content || '// no text content available'}
        </pre>
      </div>

      {toast && (
        <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
          <div className="rounded-full bg-black/85 px-3 py-1 font-mono text-[11px] font-bold text-[#98FF98]">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectFilePreview;