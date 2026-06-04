import { useState } from 'react';
import { useStore } from '../store';
import { useLanguage } from '../hooks/useLanguage';
import {
  Menu, FolderOpen, Download, Upload, Play,
  ChevronDown, GitBranch, Wifi, WifiOff,
  Plus, Clock, Bot
} from 'lucide-react';

export function Header() {
  const {
    currentProjectName, sidebarOpen, setSidebarOpen,
    recentProjects, setCurrentProject,
    addDiff, bottomPanelOpen, setBottomPanelOpen,
  } = useStore();

  const { t } = useLanguage();

  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [isOnline] = useState(true);

  const handleDemoAction = () => {
    addDiff({
      path: 'src/App.tsx',
      oldContent: `import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <h1>Hello World</h1>
    </div>
  );
}`,
      newContent: `import React from 'react';
import { Header } from './components/Header';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header title="My App" />
        <main className="container mx-auto p-4">
          <h1 className="text-3xl font-bold dark:text-white">
            Hello World
          </h1>
        </main>
      </div>
    </ThemeProvider>
  );
}`,
      status: 'pending',
      type: 'modify',
    });
  };

  return (
    <header className="flex items-center h-10 bg-[#181825] border-b border-[#313244] px-2 select-none">
      {/* Menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="p-1.5 hover:bg-[#313244] rounded text-[#6c7086] hover:text-[#cdd6f4] transition-colors lg:hidden"
      >
        <Menu size={16} />
      </button>

      {/* Logo */}
      <div className="flex items-center gap-2 px-2">
        <div className="w-5 h-5 rounded bg-gradient-to-br from-[#89b4fa] to-[#cba6f7] flex items-center justify-center">
          <Bot size={12} className="text-white" />
        </div>
        <span className="text-[13px] font-semibold text-[#cdd6f4] hidden sm:inline">DevAgent</span>
      </div>

      {/* Separator */}
      <div className="w-px h-4 bg-[#313244] mx-2" />

      {/* Project selector */}
      <div className="relative">
        <button
          onClick={() => setShowProjectMenu(!showProjectMenu)}
          className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-[#313244] transition-colors"
        >
          <FolderOpen size={13} className="text-[#fab387]" />
          <span className="text-[12px] text-[#cdd6f4]">{currentProjectName}</span>
          <ChevronDown size={12} className="text-[#6c7086]" />
        </button>

        {showProjectMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowProjectMenu(false)} />
            <div className="absolute top-full left-0 mt-1 bg-[#1e1e2e] border border-[#313244] rounded-lg shadow-xl py-1 min-w-[250px] z-50">
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-[#6c7086] font-semibold">
                Недавние проекты
              </div>
              {recentProjects.map((p) => (
                <button
                  key={p.path}
                  onClick={() => { setCurrentProject(p.name, p.path); setShowProjectMenu(false); }}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-[12px] text-[#cdd6f4] hover:bg-[#313244]"
                >
                  <Clock size={12} className="text-[#6c7086]" />
                  <div className="flex-1 text-left">
                    <div>{p.name}</div>
                    <div className="text-[10px] text-[#6c7086] truncate">{p.path}</div>
                  </div>
                </button>
              ))}
              <div className="border-t border-[#313244] my-1" />
              <button className="flex items-center gap-2 w-full px-3 py-1.5 text-[12px] text-[#89b4fa] hover:bg-[#313244]" onClick={() => setShowProjectMenu(false)}>
                <FolderOpen size={12} /> Открыть папку...
              </button>
              <button className="flex items-center gap-2 w-full px-3 py-1.5 text-[12px] text-[#a6e3a1] hover:bg-[#313244]" onClick={() => setShowProjectMenu(false)}>
                <Plus size={12} /> Новый проект из шаблона
              </button>
              <button className="flex items-center gap-2 w-full px-3 py-1.5 text-[12px] text-[#cdd6f4] hover:bg-[#313244]" onClick={() => setShowProjectMenu(false)}>
                <Upload size={12} /> Импортировать ZIP
              </button>
            </div>
          </>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={handleDemoAction}
          className="flex items-center gap-1 px-2 py-1 text-[11px] text-[#a6e3a1] bg-[#a6e3a1]/10 rounded hover:bg-[#a6e3a1]/20 transition-colors"
          title="Демо: показать diff"
        >
          <Play size={11} /> Demo Diff
        </button>

        <button className="p-1.5 hover:bg-[#313244] rounded text-[#6c7086] hover:text-[#cdd6f4]" title="Экспортировать ZIP">
          <Download size={14} />
        </button>

        <div className="flex items-center gap-1 px-2">
          <GitBranch size={12} className="text-[#cba6f7]" />
          <span className="text-[11px] text-[#6c7086]">main</span>
        </div>

        <div className="flex items-center gap-1 px-1">
          {isOnline ? (
            <Wifi size={12} className="text-[#a6e3a1]" />
          ) : (
            <WifiOff size={12} className="text-[#f38ba8]" />
          )}
        </div>

        <button
          onClick={() => setBottomPanelOpen(!bottomPanelOpen)}
          className="p-1.5 hover:bg-[#313244] rounded text-[#6c7086] hover:text-[#cdd6f4]"
          title="Переключить терминал"
        >
          <div className="w-[14px] h-[14px] opacity-0" />
        </button>
      </div>
    </header>
  );
}
