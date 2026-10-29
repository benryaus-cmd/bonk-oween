import type { ProjectFileEntry } from '@/types/projectFiles';

interface TreeNode {
  folders: Map<string, TreeNode>;
  files: string[];
}

const createNode = (): TreeNode => ({
  folders: new Map<string, TreeNode>(),
  files: [],
});

export const generateTree = (files: ProjectFileEntry[]): string => {
  const root = createNode();

  for (const file of files) {
    const parts = file.path.split('/').filter(Boolean);
    if (parts.length === 0) continue;

    let node = root;

    for (let i = 0; i < parts.length - 1; i += 1) {
      const segment = parts[i];
      let child = node.folders.get(segment);
      if (!child) {
        child = createNode();
        node.folders.set(segment, child);
      }
      node = child;
    }

    const fileName = parts[parts.length - 1];
    if (!node.files.includes(fileName)) {
      node.files.push(fileName);
    }
  }

  const lines: string[] = ['📁 ./'];

  const walk = (node: TreeNode, prefix: string) => {
    const folderNames = [...node.folders.keys()].sort((a, b) => a.localeCompare(b));
    const fileNames = [...node.files].sort((a, b) => a.localeCompare(b));

    const entries: { kind: 'folder' | 'file'; name: string }[] = [
      ...folderNames.map((name) => ({ kind: 'folder' as const, name })),
      ...fileNames.map((name) => ({ kind: 'file' as const, name })),
    ];

    entries.forEach((entry, index) => {
      const last = index === entries.length - 1;
      const branch = last ? '└── ' : '├── ';
      const childPrefix = prefix + (last ? '    ' : '│   ');

      if (entry.kind === 'folder') {
        lines.push(`${prefix}${branch}📁 ${entry.name}/`);
        const child = node.folders.get(entry.name);
        if (child) walk(child, childPrefix);
        return;
      }

      lines.push(`${prefix}${branch}📄 ${entry.name}/`);
    });
  };

  walk(root, '');

  return lines.join('\n');
};