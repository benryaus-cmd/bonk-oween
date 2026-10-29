import { useMemo, useState } from 'react';
import manifestData from 'virtual:project-file-manifest';
import type { ProjectFileEntry, ProjectManifest } from '@/types/projectFiles';
import {
  buildContentIndex,
  copyText,
  formatSize,
  searchFiles,
} from '@/dev/projectFileDiscovery';
import { generateTree } from '@/dev/projectTree';
import { downloadProjectZip } from '@/dev/projectZip';
import ProjectFilePreview from '@/components/ProjectFilePreview';

const manifest = manifestData as ProjectManifest;

type SearchMode = 'NAMES' | 'CONTENT';

const STATUS_COLOUR: Record<string, string> = {
  TEXT: '#6FE081',
  BINARY: '#FFB347',
  FAILED: '#FF6B6B',
  EMPTY: '#8F7BB0',
};

const buildSelectionBlock = (files: ProjectFileEntry[]): string => {
  const header = [
    'SELECTED PROJECT FILES',
    '',
    'PROJECT FILE TREE:',
    '',
    generateTree(files),
    '',
    'SELECTED FILES:',
  ].join('\n');

  const body = files
    .map((file) => {
      const content = file.content ?? '';
      return [
        `FILE: ${file.path}`,
        `STATUS: ${file.status}`,
        `SIZE: ${file.size}`,
        '',
        content,
        '==============================',
      ].join('\n');
    })
    .join('\n');

  return `${header}\n${body}`;
};

const ProjectFileViewer = ({ onClose }: { onClose: () => void }) => {
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('NAMES');
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [openPath, setOpenPath] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const contentIndex = useMemo(() => buildContentIndex(manifest), []);

  const results = useMemo(
    () => searchFiles(manifest.files, contentIndex, query, searchMode === 'CONTENT'),
    [query, searchMode, contentIndex],
  );

  const selectedFiles = useMemo(
    () => manifest.files.filter((file) => selectedPaths.has(file.path)),
    [selectedPaths],
  );

  const flash = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast((current) => (current === message ? '' : current)), 1500);
  };

  const toggleSelected = (path: string) => {
    setSelectedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const selectAllVisible = () => {
    setSelectedPaths((prev) => {
      const next = new Set(prev);
      for (const result of results) next.add(result.file.path);
      return next;
    });
  };

  const handleCopySelection = async () => {
    if (selectedFiles.length === 0) {
      flash('NOTHING SELECTED');
      return;
    }
    const ok = await copyText(buildSelectionBlock(selectedFiles));
    flash(ok ? 'COPIED ✓' : 'COPY FAILED');
  };

  const handleCopyTree = async () => {
    const files = selectedFiles.length > 0 ? selectedFiles : manifest.files;
    const ok = await copyText(`PROJECT FILE TREE\n\n${generateTree(files)}`);
    flash(ok ? 'TREE COPIED ✓' : 'COPY FAILED');
  };

  const handleDownloadZip = async () => {
    if (isExporting) return;
    setIsExporting(true);
    await new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => resolve());
    });
    try {
      const result = await downloadProjectZip(manifest);
      flash(
        result.cancelled
          ? `ZIP CANCELLED · ${result.included} INCLUDED · ${result.excluded} EXCLUDED`
          : `ZIP READY · ${result.included} INCLUDED · ${result.excluded} EXCLUDED`,
      );
    } catch {
      flash('ZIP EXPORT FAILED · PLEASE TRY AGAIN');
    } finally {
      setIsExporting(false);
    }
  };

  const openFile = openPath ? manifest.files.find((file) => file.path === openPath) : undefined;

  if (openFile) {
    return <ProjectFilePreview file={openFile} onBack={() => setOpenPath(null)} />;
  }

  const contentMode = searchMode === 'CONTENT';

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
          onClick={onClose}
          className="rounded-lg border border-white/20 px-2.5 py-1.5 text-[11px] font-black uppercase tracking-wider text-slate-200"
        >
          ← Close
        </button>
        <div className="min-w-0 flex-1 text-center text-[12px] font-black uppercase tracking-[0.16em] text-slate-100">
          Project Files
        </div>
        <div className="shrink-0 font-mono text-[11px] text-slate-400">
          {results.length}/{manifest.files.length}
        </div>
      </div>

      <div className="border-b border-white/10 px-3 py-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={contentMode ? 'Search names, paths & file contents…' : 'Search file names & paths...'}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          className="w-full rounded-lg border border-white/15 bg-black/60 px-3 py-2 font-mono text-[12px] text-slate-100 outline-none placeholder:text-slate-500"
        />
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => setSearchMode('NAMES')}
            className="flex-1 rounded-lg py-1.5 text-[10px] font-black uppercase tracking-wider"
            style={
              searchMode === 'NAMES'
                ? { background: '#6FE081', color: '#0B0616' }
                : { background: 'rgba(255,255,255,0.08)', color: '#B7A6D6' }
            }
          >
            Names only
          </button>
          <button
            type="button"
            onClick={() => setSearchMode('CONTENT')}
            className="flex-1 rounded-lg py-1.5 text-[10px] font-black uppercase tracking-wider"
            style={
              contentMode
                ? { background: '#FFD700', color: '#0B0616' }
                : { background: 'rgba(255,255,255,0.08)', color: '#B7A6D6' }
            }
          >
            Names + content
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3">
        {results.length === 0 && (
          <div className="py-10 text-center font-mono text-[12px] text-slate-500">No matching files</div>
        )}
        {results.map((result) => {
          const file = result.file;
          const selected = selectedPaths.has(file.path);
          return (
            <div key={file.path} className="flex items-start gap-2 border-b border-white/10 py-2">
              <button
                type="button"
                onClick={() => toggleSelected(file.path)}
                aria-label={selected ? `Deselect ${file.path}` : `Select ${file.path}`}
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border text-[12px] font-black"
                style={{
                  borderColor: selected ? '#6FE081' : 'rgba(255,255,255,0.28)',
                  background: selected ? 'rgba(111,224,129,0.18)' : 'transparent',
                  color: '#6FE081',
                }}
              >
                {selected ? '✓' : ''}
              </button>
              <button
                type="button"
                onClick={() => setOpenPath(file.path)}
                className="min-w-0 flex-1 text-left"
              >
                <div className="truncate font-mono text-[12px] font-bold text-slate-100">{file.name}</div>
                <div className="truncate font-mono text-[10px] text-slate-400">
                  {file.path} · {formatSize(file.size)}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider">
                  <span style={{ color: STATUS_COLOUR[file.status] ?? '#8F7BB0' }}>{file.status}</span>
                  {contentMode && !result.pathMatch && result.contentHits > 0 && (
                    <span style={{ color: '#FFD700' }}>· {result.contentHits} hits in content</span>
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>

      <div
        className="grid grid-cols-2 gap-2 border-t border-white/10 px-3 py-2"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)' }}
      >
        <button
          type="button"
          onClick={selectAllVisible}
          className="rounded-lg border border-white/20 py-2 text-[10px] font-black uppercase tracking-wider text-slate-200"
        >
          Select all
        </button>
        <button
          type="button"
          onClick={() => setSelectedPaths(new Set())}
          className="rounded-lg border border-white/20 py-2 text-[10px] font-black uppercase tracking-wider text-slate-200"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={handleCopySelection}
          className="rounded-lg py-2 text-[10px] font-black uppercase tracking-wider"
          style={{ background: '#6FE081', color: '#0B0616' }}
        >
          Copy sel ({selectedFiles.length})
        </button>
        <button
          type="button"
          onClick={handleDownloadZip}
          disabled={isExporting}
          className="col-span-2 rounded-lg border border-white/20 py-2 text-[10px] font-black uppercase tracking-wider text-slate-100 disabled:opacity-60"
          style={{ background: 'rgba(138,43,226,0.34)' }}
        >
          {isExporting ? 'Preparing ZIP' : 'Download ZIP'}
        </button>
      </div>

      {toast && (
        <div className="pointer-events-none absolute inset-x-0 bottom-24 flex justify-center">
          <div className="rounded-full bg-black/85 px-3 py-1 font-mono text-[11px] font-bold text-[#98FF98]">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectFileViewer;