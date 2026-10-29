import { strToU8, zipSync } from 'fflate';
import type { ProjectManifest } from '@/types/projectFiles';

export interface ProjectZipResult {
  included: number;
  excluded: number;
  cancelled: boolean;
}

export const downloadProjectZip = async (
  manifest: ProjectManifest,
): Promise<ProjectZipResult> => {
  const entries: Record<string, Uint8Array> = {};
  let included = 0;

  for (const file of manifest.files) {
    if (file.status === 'TEXT' && typeof file.content === 'string') {
      entries[file.path] = strToU8(file.content);
      included += 1;
    } else if (file.status === 'EMPTY') {
      entries[file.path] = new Uint8Array(0);
      included += 1;
    }
  }

  if (included === 0) {
    throw new Error('No available project file contents to export.');
  }

  const bytes = zipSync(entries, { level: 6 });
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  const zipFile = new File([buffer], 'project-files.zip', {
    type: 'application/zip',
  });
  const result = {
    included,
    excluded: manifest.files.length - included,
    cancelled: false,
  };

  if (
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [zipFile] })
  ) {
    try {
      await navigator.share({ files: [zipFile], title: 'Project files' });
      return result;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return { ...result, cancelled: true };
      }
    }
  }

  const url = URL.createObjectURL(zipFile);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'project-files.zip';
  anchor.style.display = 'none';

  try {
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 30000);
  } catch (error) {
    anchor.remove();
    URL.revokeObjectURL(url);
    throw error;
  }

  return result;
};