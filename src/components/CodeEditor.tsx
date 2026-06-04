import { useState, useRef, useCallback, useEffect } from 'react';
import { useStore } from '../store';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  X, Circle, Search, Replace, ChevronDown, ChevronUp,
  Bot, FolderOpen, FileCode2
} from 'lucide-react';

export function CodeEditor() {
  const { tabs, activeTabId, closeTab, setActiveTab, updateTabContent } = useStore();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearch(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        setShowSearch(true);
        setShowReplace(true);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
        setShowReplace(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (activeTabId) {
      updateTabContent(activeTabId, e.target.value);
    }
  }, [activeTabId, updateTabContent]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const value = target.value;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      if (activeTabId) {
        updateTabContent(activeTabId, newValue);
        setTimeout(() => {
          target.selectionStart = target.selectionEnd = start + 2;
        }, 0);
      }
    }
  }, [activeTabId, updateTabContent]);

  if (tabs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#11111b] text-center">
        <div className="w-20 h-20 rounded-2xl bg-[#1e1e2e] flex items-center justify-center mb-6 border border-[#313244]">
          <FileCode2 size={36} className="text-[#45475a]" />
        </div>
        <h3 className="text-lg font-semibold text-[#585b70] mb-2">No files open</h3>
        <p className="text-[13px] text-[#45475a] max-w-[300px] mb-6">
          Open a file from the explorer or ask the AI agent to create one.
        </p>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1e1e2e] border border-[#313244] text-[13px] text-[#bac2de] hover:border-[#89b4fa] transition-colors">
            <FolderOpen size={14} /> Open file
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#89b4fa]/10 border border-[#89b4fa]/30 text-[13px] text-[#89b4fa] hover:bg-[#89b4fa]/20 transition-colors">
            <Bot size={14} /> Ask AI
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#11111b]">
      {/* Tabs */}
      <div className="flex bg-[#181825] border-b border-[#313244] overflow-x-auto">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`group flex items-center gap-1.5 px-3 h-[35px] text-[12px] cursor-pointer border-r border-[#313244] min-w-0 flex-shrink-0 ${
              tab.id === activeTabId
                ? 'bg-[#1e1e2e] text-[#cdd6f4] border-t-2 border-t-[#89b4fa]'
                : 'text-[#6c7086] hover:text-[#bac2de] hover:bg-[#1e1e2e]/50 border-t-2 border-t-transparent'
            }`}
          >
            {tab.isModified && (
              <Circle size={8} className="text-[#f9e2af] fill-[#f9e2af] flex-shrink-0" />
            )}
            <span className="truncate max-w-[120px]">{tab.name}</span>
            <button
              onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
              className="opacity-0 group-hover:opacity-100 hover:bg-[#313244] rounded p-0.5 transition-opacity flex-shrink-0"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* Search bar */}
      {showSearch && (
        <div className="flex flex-col gap-1 px-3 py-2 bg-[#1e1e2e] border-b border-[#313244]">
          <div className="flex items-center gap-2">
            <Search size={14} className="text-[#6c7086]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              autoFocus
              className="flex-1 bg-[#11111b] border border-[#313244] rounded px-2 py-1 text-[12px] text-[#cdd6f4] placeholder-[#6c7086] focus:border-[#89b4fa] focus:outline-none"
            />
            <button onClick={() => setShowReplace(!showReplace)} className="text-[#6c7086] hover:text-[#cdd6f4]">
              {showReplace ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <button onClick={() => { setShowSearch(false); setShowReplace(false); }} className="text-[#6c7086] hover:text-[#cdd6f4]">
              <X size={14} />
            </button>
          </div>
          {showReplace && (
            <div className="flex items-center gap-2">
              <Replace size={14} className="text-[#6c7086]" />
              <input
                type="text"
                value={replaceQuery}
                onChange={(e) => setReplaceQuery(e.target.value)}
                placeholder="Replace..."
                className="flex-1 bg-[#11111b] border border-[#313244] rounded px-2 py-1 text-[12px] text-[#cdd6f4] placeholder-[#6c7086] focus:border-[#89b4fa] focus:outline-none"
              />
              <button className="px-2 py-0.5 text-[11px] bg-[#313244] text-[#cdd6f4] rounded hover:bg-[#45475a]">
                Replace
              </button>
              <button className="px-2 py-0.5 text-[11px] bg-[#313244] text-[#cdd6f4] rounded hover:bg-[#45475a]">
                All
              </button>
            </div>
          )}
        </div>
      )}

      {/* Editor content */}
      {activeTab && (
        <div className="flex-1 flex overflow-hidden">
          {/* Line numbers + syntax highlight preview */}
          <div className="flex-1 relative">
            {/* Syntax highlighted background */}
            <div className="absolute inset-0 overflow-auto pointer-events-none p-0" aria-hidden>
              <SyntaxHighlighter
                language={activeTab.language}
                style={oneDark}
                showLineNumbers
                lineNumberStyle={{ minWidth: '3em', paddingRight: '1em', color: '#45475a', fontSize: '12px', userSelect: 'none' }}
                customStyle={{
                  margin: 0,
                  padding: '8px 0',
                  background: 'transparent',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  fontFamily: '"Fira Code", "JetBrains Mono", "Cascadia Code", monospace',
                  minHeight: '100%',
                }}
                wrapLines
              >
                {activeTab.content || ' '}
              </SyntaxHighlighter>
            </div>
            {/* Editable textarea overlay */}
            <textarea
              ref={editorRef}
              value={activeTab.content}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-[#cdd6f4] resize-none focus:outline-none overflow-auto font-mono"
              style={{
                fontSize: '13px',
                lineHeight: '1.6',
                padding: '8px 0 8px 4.5em',
                fontFamily: '"Fira Code", "JetBrains Mono", "Cascadia Code", monospace',
                tabSize: 2,
              }}
            />
          </div>
        </div>
      )}

      {/* Status bar */}
      {activeTab && (
        <div className="flex items-center justify-between px-3 h-[24px] bg-[#181825] border-t border-[#313244] text-[11px] text-[#6c7086]">
          <div className="flex items-center gap-3">
            <span>{activeTab.language}</span>
            <span>UTF-8</span>
            <span>LF</span>
          </div>
          <div className="flex items-center gap-3">
            <span>{activeTab.content.split('\n').length} lines</span>
            <span>{activeTab.isModified ? '● Modified' : '✓ Saved'}</span>
          </div>
        </div>
      )}
    </div>
  );
}
