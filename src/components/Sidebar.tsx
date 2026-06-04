import { useStore } from '../store';
import {
  MessageSquare, FolderTree, Search, Terminal,
  Settings, Brain, ChevronLeft, ChevronRight
} from 'lucide-react';

const panels = [
  { id: 'chat' as const, icon: MessageSquare, label: 'AI Chat' },
  { id: 'explorer' as const, icon: FolderTree, label: 'Explorer' },
  { id: 'search' as const, icon: Search, label: 'Search' },
  { id: 'terminal' as const, icon: Terminal, label: 'Terminal' },
  { id: 'memory' as const, icon: Brain, label: 'Project Memory' },
  { id: 'settings' as const, icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const { activePanel, setActivePanel, sidebarOpen, setSidebarOpen } = useStore();

  return (
    <div className="flex h-full flex-col bg-[#1e1e2e] border-r border-[#313244]">
      {panels.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => {
            if (activePanel === id && sidebarOpen) {
              setSidebarOpen(false);
            } else {
              setActivePanel(id);
              setSidebarOpen(true);
            }
          }}
          title={label}
          className={`relative flex items-center justify-center w-12 h-12 transition-colors ${
            activePanel === id && sidebarOpen
              ? 'text-[#cdd6f4] bg-[#313244] border-l-2 border-[#89b4fa]'
              : 'text-[#6c7086] hover:text-[#cdd6f4] border-l-2 border-transparent'
          }`}
        >
          <Icon size={20} />
        </button>
      ))}
      <div className="flex-1" />
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="flex items-center justify-center w-12 h-10 text-[#6c7086] hover:text-[#cdd6f4] transition-colors"
        title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>
    </div>
  );
}
