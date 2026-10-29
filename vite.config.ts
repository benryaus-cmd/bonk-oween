import { defineConfig, type Plugin } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import fs from 'fs';
import path from 'path';
import { viteSingleFile } from 'vite-plugin-singlefile';
/** IMPORTANT: DO NOT REMOVE THIS LINE */
import { aippyTaggerPlugin, aippyPreloadPlugin, assetConstantsPlugin } from '@aippy/vite-plugins';

/* ------------------------------------------------------------------
 * Hidden developer utility: build-time project file manifest.
 * Exposed only through the virtual module below, which is consumed by
 * the lazy-loaded developer file viewer. No runtime filesystem access.
 * ------------------------------------------------------------------ */
const TEXT_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.json',
  '.css',
  '.scss',
  '.html',
  '.md',
  '.txt',
  '.yaml',
  '.yml',
]);
const SKIP_DIRECTORIES = new Set([
  'node_modules',
  '.git',
  '.vite',
  'dist',
  'build',
  'out',
  'coverage',
  '.cache',
  '.next',
  '.turbo',
  '.idea',
  '.vscode',
]);
const SKIP_FILES = new Set([
  'assets-plan.json',
  'pnpm-lock.yaml',
  'package-lock.json',
  'yarn.lock',
]);
const SKIP_RELATIVE_PATHS = new Set([
  'src/config/assets.json',
  'src/config/assets.ts',
]);
const MAX_TEXT_BYTES = 200000;

const buildProjectManifest = () => {
  const root = process.cwd();
  const files: {
    path: string;
    name: string;
    dir: string;
    ext: string;
    size: number;
    status: string;
    error?: string;
    content?: string;
  }[] = [];
  const folders = new Set<string>();

  const walk = (dir: string) => {
    let entries: { name: string; isDirectory: () => boolean; isFile: () => boolean }[] = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const absolute = path.join(dir, entry.name);
      const relative = path.relative(root, absolute).split(path.sep).join('/');

      if (entry.isDirectory()) {
        if (SKIP_DIRECTORIES.has(entry.name) || entry.name.startsWith('.')) continue;
        folders.add(relative);
        walk(absolute);
        continue;
      }

      if (!entry.isFile()) continue;
      if (SKIP_FILES.has(entry.name)) continue;
      if (SKIP_FILES.has(relative)) continue;
      if (SKIP_RELATIVE_PATHS.has(relative)) continue;
      if (entry.name.startsWith('.env')) continue;
      if (entry.name.includes('.pem') || entry.name.includes('.key')) continue;

      const extMatch = /\.([^.]+)$/.exec(entry.name);
      const ext = extMatch ? `.${extMatch[1].toLowerCase()}` : '';

      let size = 0;
      try {
        size = fs.statSync(absolute).size;
      } catch {
        size = 0;
      }

      let status = 'BINARY';
      let content: string | undefined;
      let error: string | undefined;

      if (size === 0) {
        status = 'EMPTY';
      } else if (TEXT_EXTENSIONS.has(ext)) {
        if (size > MAX_TEXT_BYTES) {
          status = 'BINARY';
          error = 'File too large to embed';
        } else {
          try {
            content = fs.readFileSync(absolute, 'utf8');
            status = 'TEXT';
          } catch (readError) {
            status = 'FAILED';
            error = readError instanceof Error ? readError.message : 'Read failed';
          }
        }
      }

      const parts = relative.split('/');
      parts.pop();

      files.push({
        path: relative,
        name: entry.name,
        dir: parts.join('/'),
        ext,
        size,
        status,
        ...(content !== undefined ? { content } : {}),
        ...(error !== undefined ? { error } : {}),
      });
    }
  };

  walk(root);
  files.sort((a, b) => a.path.localeCompare(b.path));

  return {
    generatedAt: Date.now(),
    files,
    folders: [...folders].sort(),
  };
};

function projectFileManifestPlugin(): Plugin {
  const virtualId = 'virtual:project-file-manifest';
  const resolvedId = `\0${virtualId}`;

  return {
    name: 'aippy-project-file-manifest',
    resolveId(id: string) {
      return id === virtualId ? resolvedId : null;
    },
    load(id: string) {
      if (id !== resolvedId) return null;
      const json = JSON.stringify(buildProjectManifest()).replace(/<\//g, '<\\/');
      return `export default ${json};`;
    },
  };
}

export default defineConfig(({ mode }) => ({
  server: {
    host: '::',
    port: 8080
  },
  // IMPORTANT: DO NOT REMOVE THIS THREE PLUGINS
  plugins: [
    react(),
    tailwindcss(),
    // Hidden developer utility: exposes the project's source files as a
    // virtual module (metadata for binaries, text for source files).
    projectFileManifestPlugin(),
    // Development only: asset constants plugin
    mode === 'development' && assetConstantsPlugin({
      extensions: ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.mp4', '.mp3', '.wav', '.ogg', '.webm'],
      srcDir: 'src',
      outputFile: 'src/config/assets.json',
      devMode: true
    }),
    // Development only: component tagging for inspector
    mode === 'development' && aippyTaggerPlugin(),
    // bundle optimization
    viteSingleFile({
      useRecommendedBuildConfig: true,
      removeViteModuleLoader: true,
      deleteInlinedFiles: true
    }),
    // asset preload for aippy app (scans source files)
    aippyPreloadPlugin({
      extensions: ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.mp3', '.wav', '.ogg', '.webm', '.task', '.tflite'],
      srcDir: 'src',
      outDir: 'dist',
      deepScan: true
    }),
    // Remove inspector script in production
    mode === 'production' && {
      name: 'remove-inspector-script',
      transformIndexHtml(html: string) {
        return html.replace(
          /<!-- Inspector script for iframe editing mode -->[\s\S]*?<!-- Inspector script end -->/,
          ''
        );
      },
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src')
    }
  },
  build: {
    sourcemap: mode === 'development',
    minify: mode === 'production',
  },
}));
