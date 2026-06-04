import { useStore } from './store';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatPanel } from './components/ChatPanel';
import { FileExplorer } from './components/FileExplorer';
import { CodeEditor } from './components/CodeEditor';
import { SearchPanel } from './components/SearchPanel';
import { TerminalPanel } from './components/TerminalPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { MemoryPanel } from './components/MemoryPanel';
import { DiffModal } from './components/DiffModal';
import { Terminal, AlertTriangle, FileOutput } from 'lucide-react';

function PanelContent() {
  const { activePanel } = useStore();
  switch (activePanel) {
    case 'chat': return <ChatPanel />;
    case 'explorer': return <FileExplorer />;
    case 'search': return <SearchPanel />;
    case 'terminal': return <TerminalPanel />;
    case 'settings': return <SettingsPanel />;
    case 'memory': return <MemoryPanel />;
    default: return <ChatPanel />;
  }
}

function BottomPanel() {
  const { bottomPanelOpen, bottomPanel, setBottomPanel, setBottomPanelOpen } = useStore();

  if (!bottomPanelOpen) return null;

  const tabs = [
    { id: 'terminal' as const, label: 'Terminal', icon: Terminal },
    { id: 'problems' as const, label: 'Problems', icon: AlertTriangle },
    { id: 'output' as const, label: 'Output', icon: FileOutput },
  ];

  return (
    <div className="h-[250px] border-t border-[#313244] flex flex-col bg-[#181825] flex-shrink-0">
      <div className="flex items-center border-b border-[#313244] px-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setBottomPanel(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] border-b-2 transition-colors ${
              bottomPanel === id
                ? 'text-[#cdd6f4] border-[#89b4fa]'
                : 'text-[#6c7086] border-transparent hover:text-[#bac2de]'
            }`}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={() => setBottomPanelOpen(false)}
          className="text-[#6c7086] hover:text-[#cdd6f4] px-2 py-1 text-[11px]"
        >
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        {bottomPanel === 'terminal' && <TerminalPanel />}
        {bottomPanel === 'problems' && (
          <div className="flex items-center justify-center h-full text-[#6c7086] text-[12px]">
            No problems detected
          </div>
        )}
        {bottomPanel === 'output' && (
          <div className="flex items-center justify-center h-full text-[#6c7086] text-[12px]">
            No output
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const { sidebarOpen } = useStore();

  return (
    <div className="flex flex-col h-screen bg-[#11111b] text-[#cdd6f4] overflow-hidden">
      {/* Top Header */}
      <Header />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar */}
        <Sidebar />

        {/* Side Panel */}
        {sidebarOpen && (
          <div className="w-[280px] lg:w-[320px] flex-shrink-0 border-r border-[#313244] overflow-hidden">
            <PanelContent />
          </div>
        )}

        {/* Editor area + bottom panel */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="flex-1 overflow-hidden">
            <CodeEditor />
          </div>
          <BottomPanel />
        </div>
      </div>

      {/* Diff Modal */}
      <DiffModal />
    </div>
  );
}
