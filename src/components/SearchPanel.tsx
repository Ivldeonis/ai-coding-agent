import { useState } from 'react';
import { useStore } from '../store';
import { Search, FileText, ChevronRight, Filter, ToggleLeft, ToggleRight } from 'lucide-react';
import { getFileContent } from '../services/aiService';
import { getLanguageFromPath } from '../utils/fileIcons';
import type { FileNode } from '../types';

function flattenFiles(nodes: FileNode[]): { name: string; path: string }[] {
  const result: { name: string; path: string }[] = [];
  for (const node of nodes) {
    if (node.type === 'file') result.push({ name: node.name, path: node.path });
    if (node.children) result.push(...flattenFiles(node.children));
  }
  return result;
}

interface SearchResult {
  path: string;
  line: number;
  content: string;
  matchStart: number;
  matchEnd: number;
}

export function SearchPanel() {
  const { fileTree, openTab } = useStore();
  const [query, setQuery] = useState('');
  const [fileFilter, setFileFilter] = useState('');
  const [useRegex, setUseRegex] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());

  const handleSearch = () => {
    if (!query.trim()) return;
    setIsSearching(true);

    const files = flattenFiles(fileTree);
    const searchResults: SearchResult[] = [];

    for (const file of files) {
      if (fileFilter && !file.path.includes(fileFilter)) continue;

      const content = getFileContent(file.path);
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        try {
          const flags = caseSensitive ? 'g' : 'gi';
          const pattern = useRegex ? new RegExp(query, flags) : new RegExp(escapeRegex(query), flags);
          const match = pattern.exec(line);
          if (match) {
            searchResults.push({
              path: file.path,
              line: i + 1,
              content: line.trim(),
              matchStart: match.index,
              matchEnd: match.index + match[0].length,
            });
          }
        } catch {
          // Invalid regex
        }
      }
    }

    setResults(searchResults);
    setExpandedFiles(new Set(searchResults.map(r => r.path)));
    setIsSearching(false);
  };

  const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const groupedResults = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.path]) acc[r.path] = [];
    acc[r.path].push(r);
    return acc;
  }, {});

  const handleOpenFile = (path: string, _line: number) => {
    const content = getFileContent(path);
    const name = path.split('/').pop() || path;
    openTab({
      path,
      name,
      content,
      savedContent: content,
      language: getLanguageFromPath(path),
      isModified: false,
    });
  };

  const toggleFile = (path: string) => {
    setExpandedFiles(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#181825]">
      <div className="px-3 py-2 border-b border-[#313244]">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#a6adc8]">
          Search
        </span>
      </div>

      <div className="px-2 py-2 space-y-1.5 border-b border-[#313244]">
        <div className="flex items-center gap-1">
          <div className="flex-1 flex items-center bg-[#1e1e2e] border border-[#313244] rounded focus-within:border-[#89b4fa]">
            <Search size={13} className="ml-2 text-[#6c7086]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search in files..."
              className="flex-1 bg-transparent px-2 py-1.5 text-[12px] text-[#cdd6f4] placeholder-[#6c7086] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Filter size={13} className="ml-1 text-[#6c7086]" />
          <input
            type="text"
            value={fileFilter}
            onChange={(e) => setFileFilter(e.target.value)}
            placeholder="File filter (e.g. .tsx)"
            className="flex-1 bg-[#1e1e2e] border border-[#313244] rounded px-2 py-1 text-[12px] text-[#cdd6f4] placeholder-[#6c7086] focus:border-[#89b4fa] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 px-1">
          <button onClick={() => setUseRegex(!useRegex)} className="flex items-center gap-1 text-[11px] text-[#6c7086] hover:text-[#cdd6f4]">
            {useRegex ? <ToggleRight size={14} className="text-[#89b4fa]" /> : <ToggleLeft size={14} />}
            Regex
          </button>
          <button onClick={() => setCaseSensitive(!caseSensitive)} className="flex items-center gap-1 text-[11px] text-[#6c7086] hover:text-[#cdd6f4]">
            {caseSensitive ? <ToggleRight size={14} className="text-[#89b4fa]" /> : <ToggleLeft size={14} />}
            Case
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {isSearching && (
          <div className="flex items-center justify-center py-8 text-[#6c7086] text-[12px]">
            Searching...
          </div>
        )}

        {!isSearching && results.length === 0 && query && (
          <div className="flex flex-col items-center justify-center py-8 text-[#6c7086] text-[12px]">
            No results found
          </div>
        )}

        {!isSearching && results.length > 0 && (
          <div className="px-1">
            <div className="px-2 py-1 text-[11px] text-[#6c7086]">
              {results.length} result{results.length !== 1 ? 's' : ''} in {Object.keys(groupedResults).length} file{Object.keys(groupedResults).length !== 1 ? 's' : ''}
            </div>
            {Object.entries(groupedResults).map(([path, fileResults]) => (
              <div key={path}>
                <button
                  onClick={() => toggleFile(path)}
                  className="flex items-center gap-1 w-full px-2 py-1 text-[12px] text-[#cdd6f4] hover:bg-[#313244] rounded"
                >
                  <ChevronRight size={12} className={expandedFiles.has(path) ? 'rotate-90 transition-transform' : 'transition-transform'} />
                  <FileText size={13} className="text-[#89b4fa]" />
                  <span className="truncate">{path}</span>
                  <span className="ml-auto text-[#6c7086] text-[10px]">{fileResults.length}</span>
                </button>
                {expandedFiles.has(path) && fileResults.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => handleOpenFile(r.path, r.line)}
                    className="flex items-start gap-2 w-full px-6 py-1 text-[12px] text-[#bac2de] hover:bg-[#313244] rounded"
                  >
                    <span className="text-[#6c7086] min-w-[32px] text-right">{r.line}</span>
                    <span className="truncate font-mono text-[11px]">{r.content}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
