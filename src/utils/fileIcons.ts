export function getFileIcon(name: string): { icon: string; color: string } {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  const iconMap: Record<string, { icon: string; color: string }> = {
    'tsx': { icon: '⚛', color: '#61DAFB' },
    'jsx': { icon: '⚛', color: '#61DAFB' },
    'ts': { icon: 'TS', color: '#3178C6' },
    'js': { icon: 'JS', color: '#F7DF1E' },
    'json': { icon: '{}', color: '#A8B9CC' },
    'css': { icon: '#', color: '#1572B6' },
    'scss': { icon: '#', color: '#CC6699' },
    'html': { icon: '<>', color: '#E34F26' },
    'md': { icon: 'M↓', color: '#FFFFFF' },
    'py': { icon: '🐍', color: '#3776AB' },
    'kt': { icon: 'K', color: '#A97BFF' },
    'java': { icon: '☕', color: '#ED8B00' },
    'rs': { icon: '🦀', color: '#CE422B' },
    'go': { icon: 'Go', color: '#00ADD8' },
    'yaml': { icon: 'Y', color: '#CB171E' },
    'yml': { icon: 'Y', color: '#CB171E' },
    'toml': { icon: 'T', color: '#9C4121' },
    'xml': { icon: '⟨⟩', color: '#E44D26' },
    'svg': { icon: '◇', color: '#FFB13B' },
    'png': { icon: '🖼', color: '#FFB13B' },
    'jpg': { icon: '🖼', color: '#FFB13B' },
    'gif': { icon: '🖼', color: '#FFB13B' },
    'gitignore': { icon: '', color: '#F05032' },
    'env': { icon: '⚙', color: '#ECD53F' },
    'lock': { icon: '🔒', color: '#888888' },
    'sh': { icon: '$', color: '#4EAA25' },
    'bash': { icon: '$', color: '#4EAA25' },
    'txt': { icon: '📄', color: '#AAAAAA' },
    'log': { icon: '📋', color: '#AAAAAA' },
  };
  return iconMap[ext] || { icon: '📄', color: '#AAAAAA' };
}

export function getLanguageFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  const langMap: Record<string, string> = {
    'tsx': 'typescript',
    'ts': 'typescript',
    'jsx': 'javascript',
    'js': 'javascript',
    'json': 'json',
    'css': 'css',
    'scss': 'scss',
    'html': 'html',
    'md': 'markdown',
    'py': 'python',
    'kt': 'kotlin',
    'java': 'java',
    'rs': 'rust',
    'go': 'go',
    'yaml': 'yaml',
    'yml': 'yaml',
    'toml': 'toml',
    'xml': 'xml',
    'svg': 'xml',
    'sh': 'bash',
    'bash': 'bash',
  };
  return langMap[ext] || 'plaintext';
}
