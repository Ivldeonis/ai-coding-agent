import { create } from 'zustand';
import type { ChatMessage, FileNode, EditorTab, DiffChange, AIProvider, AgentMode, AppSettings, TerminalLine, ProjectMemory } from './types';
import { DEFAULT_SETTINGS } from './types';
import { v4 as uuid } from 'uuid';

interface AppState {
  // UI State
  activePanel: 'chat' | 'explorer' | 'search' | 'terminal' | 'settings' | 'memory';
  sidebarOpen: boolean;
  bottomPanelOpen: boolean;
  bottomPanel: 'terminal' | 'problems' | 'output';
  showDiffModal: boolean;
  showSettingsModal: boolean;
  showProviderModal: boolean;

  // Chat
  messages: ChatMessage[];
  isGenerating: boolean;
  streamingMessageId: string | null;

  // Files
  fileTree: FileNode[];
  currentProjectPath: string;
  currentProjectName: string;
  recentProjects: { name: string; path: string; lastOpened: number }[];

  // Editor
  tabs: EditorTab[];
  activeTabId: string | null;

  // Diff
  pendingDiffs: DiffChange[];

  // AI
  providers: AIProvider[];
  activeProviderId: string | null;
  agentMode: AgentMode;

  // Terminal
  terminalLines: TerminalLine[];

  // Settings
  settings: AppSettings;

  // Memory
  projectMemory: ProjectMemory;

  // Actions
  setSidebarOpen: (open: boolean) => void;
  setActivePanel: (panel: AppState['activePanel']) => void;
  setBottomPanelOpen: (open: boolean) => void;
  setBottomPanel: (panel: AppState['bottomPanel']) => void;
  setShowDiffModal: (show: boolean) => void;
  setShowSettingsModal: (show: boolean) => void;
  setShowProviderModal: (show: boolean) => void;

  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => string;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  clearMessages: () => void;
  setIsGenerating: (v: boolean) => void;
  setStreamingMessageId: (id: string | null) => void;

  setFileTree: (tree: FileNode[]) => void;
  toggleFolder: (path: string) => void;
  setCurrentProject: (name: string, path: string) => void;

  openTab: (tab: Omit<EditorTab, 'id'>) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string | null) => void;
  updateTabContent: (id: string, content: string) => void;
  markTabSaved: (id: string) => void;

  addDiff: (diff: Omit<DiffChange, 'id'>) => void;
  updateDiff: (id: string, updates: Partial<DiffChange>) => void;
  clearDiffs: () => void;

  addProvider: (provider: Omit<AIProvider, 'id'>) => void;
  updateProvider: (id: string, updates: Partial<AIProvider>) => void;
  removeProvider: (id: string) => void;
  setActiveProvider: (id: string | null) => void;
  setAgentMode: (mode: AgentMode) => void;

  addTerminalLine: (line: Omit<TerminalLine, 'id' | 'timestamp'>) => void;
  clearTerminal: () => void;

  updateSettings: (updates: Partial<AppSettings>) => void;
  updateMemory: (updates: Partial<ProjectMemory>) => void;
}

const DEMO_FILE_TREE: FileNode[] = [
  {
    name: 'src', path: 'src', type: 'folder', expanded: true, children: [
      { name: 'App.tsx', path: 'src/App.tsx', type: 'file' },
      { name: 'main.tsx', path: 'src/main.tsx', type: 'file' },
      { name: 'index.css', path: 'src/index.css', type: 'file' },
      {
        name: 'components', path: 'src/components', type: 'folder', expanded: false, children: [
          { name: 'Header.tsx', path: 'src/components/Header.tsx', type: 'file' },
          { name: 'Button.tsx', path: 'src/components/Button.tsx', type: 'file' },
        ]
      },
      {
        name: 'hooks', path: 'src/hooks', type: 'folder', expanded: false, children: [
          { name: 'useAuth.ts', path: 'src/hooks/useAuth.ts', type: 'file' },
        ]
      },
    ]
  },
  { name: 'package.json', path: 'package.json', type: 'file' },
  { name: 'tsconfig.json', path: 'tsconfig.json', type: 'file' },
  { name: 'vite.config.ts', path: 'vite.config.ts', type: 'file' },
  { name: '.gitignore', path: '.gitignore', type: 'file' },
  { name: 'README.md', path: 'README.md', type: 'file' },
];

export const useStore = create<AppState>((set) => ({
  // UI
  activePanel: 'chat',
  sidebarOpen: true,
  bottomPanelOpen: false,
  bottomPanel: 'terminal',
  showDiffModal: false,
  showSettingsModal: false,
  showProviderModal: false,

  // Chat
  messages: [],
  isGenerating: false,
  streamingMessageId: null,

  // Files
  fileTree: DEMO_FILE_TREE,
  currentProjectPath: '/storage/emulated/0/Projects/my-app',
  currentProjectName: 'my-app',
  recentProjects: [
    { name: 'my-app', path: '/storage/emulated/0/Projects/my-app', lastOpened: Date.now() },
    { name: 'api-server', path: '/storage/emulated/0/Projects/api-server', lastOpened: Date.now() - 86400000 },
  ],

  // Editor
  tabs: [],
  activeTabId: null,

  // Diff
  pendingDiffs: [],

  // AI
  providers: [
    { id: 'default-openai', name: 'OpenAI', type: 'openai', baseUrl: 'https://api.openai.com/v1', apiKey: '', model: 'gpt-4o', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'o1-mini', 'o1-preview'] },
    { id: 'default-openrouter', name: 'OpenRouter', type: 'openrouter', baseUrl: 'https://openrouter.ai/api/v1', apiKey: '', model: 'anthropic/claude-sonnet-4', models: ['anthropic/claude-sonnet-4', 'openai/gpt-4o', 'google/gemini-2.5-pro'] },
    { id: 'default-gemini', name: 'Gemini', type: 'gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta', apiKey: '', model: 'gemini-2.5-pro', models: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash'] },
    { id: 'default-local', name: 'Local (Ollama)', type: 'local', baseUrl: 'http://localhost:11434/v1', apiKey: '', model: 'llama3', models: ['llama3', 'codellama', 'mistral', 'deepseek-coder'] },
  ],
  activeProviderId: 'default-openai',
  agentMode: 'agent',

  // Terminal
  terminalLines: [
    { id: '1', type: 'system', content: '╔══════════════════════════════════════╗', timestamp: Date.now() },
    { id: '2', type: 'system', content: '║  DevAgent AI Terminal v1.0           ║', timestamp: Date.now() },
    { id: '3', type: 'system', content: '║  Type "help" for available commands  ║', timestamp: Date.now() },
    { id: '4', type: 'system', content: '╚══════════════════════════════════════╝', timestamp: Date.now() },
  ],

  // Settings
  settings: DEFAULT_SETTINGS,

  // Memory
  projectMemory: {
    rules: ['Use functional React components with hooks', 'Follow Airbnb ESLint style guide', 'Use TypeScript strict mode'],
    envVars: { 'API_URL': 'https://api.example.com', 'NODE_ENV': 'development' },
    instructions: 'Always explain changes before making them. Prefer composition over inheritance.',
    architecture: 'React + TypeScript frontend with Vite bundler. State managed with Zustand.',
  },

  // Actions
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActivePanel: (panel) => set({ activePanel: panel }),
  setBottomPanelOpen: (open) => set({ bottomPanelOpen: open }),
  setBottomPanel: (panel) => set({ bottomPanel: panel }),
  setShowDiffModal: (show) => set({ showDiffModal: show }),
  setShowSettingsModal: (show) => set({ showSettingsModal: show }),
  setShowProviderModal: (show) => set({ showProviderModal: show }),

  addMessage: (msg) => {
    const id = uuid();
    set((s) => ({ messages: [...s.messages, { ...msg, id, timestamp: Date.now() }] }));
    return id;
  },
  updateMessage: (id, updates) => set((s) => ({
    messages: s.messages.map((m) => m.id === id ? { ...m, ...updates } : m),
  })),
  clearMessages: () => set({ messages: [] }),
  setIsGenerating: (v) => set({ isGenerating: v }),
  setStreamingMessageId: (id) => set({ streamingMessageId: id }),

  setFileTree: (tree) => set({ fileTree: tree }),
  toggleFolder: (path) => set((s) => ({
    fileTree: toggleNode(s.fileTree, path),
  })),
  setCurrentProject: (name, path) => set((s) => ({
    currentProjectName: name,
    currentProjectPath: path,
    recentProjects: [
      { name, path, lastOpened: Date.now() },
      ...s.recentProjects.filter((p) => p.path !== path),
    ].slice(0, s.settings.maxRecentProjects),
  })),

  openTab: (tab) => set((s) => {
    const existing = s.tabs.find((t) => t.path === tab.path);
    if (existing) return { activeTabId: existing.id };
    const id = uuid();
    return {
      tabs: [...s.tabs, { ...tab, id }],
      activeTabId: id,
    };
  }),
  closeTab: (id) => set((s) => {
    const idx = s.tabs.findIndex((t) => t.id === id);
    const newTabs = s.tabs.filter((t) => t.id !== id);
    let newActive = s.activeTabId;
    if (s.activeTabId === id) {
      newActive = newTabs[Math.min(idx, newTabs.length - 1)]?.id ?? null;
    }
    return { tabs: newTabs, activeTabId: newActive };
  }),
  setActiveTab: (id) => set({ activeTabId: id }),
  updateTabContent: (id, content) => set((s) => ({
    tabs: s.tabs.map((t) => t.id === id ? { ...t, content, isModified: content !== t.savedContent } : t),
  })),
  markTabSaved: (id) => set((s) => ({
    tabs: s.tabs.map((t) => t.id === id ? { ...t, savedContent: t.content, isModified: false } : t),
  })),

  addDiff: (diff) => set((s) => ({ pendingDiffs: [...s.pendingDiffs, { ...diff, id: uuid() }], showDiffModal: true })),
  updateDiff: (id, updates) => set((s) => ({
    pendingDiffs: s.pendingDiffs.map((d) => d.id === id ? { ...d, ...updates } : d),
  })),
  clearDiffs: () => set({ pendingDiffs: [], showDiffModal: false }),

  addProvider: (provider) => set((s) => ({
    providers: [...s.providers, { ...provider, id: uuid() }],
  })),
  updateProvider: (id, updates) => set((s) => ({
    providers: s.providers.map((p) => p.id === id ? { ...p, ...updates } : p),
  })),
  removeProvider: (id) => set((s) => ({
    providers: s.providers.filter((p) => p.id !== id),
    activeProviderId: s.activeProviderId === id ? null : s.activeProviderId,
  })),
  setActiveProvider: (id) => set({ activeProviderId: id }),
  setAgentMode: (mode) => set({ agentMode: mode }),

  addTerminalLine: (line) => set((s) => ({
    terminalLines: [...s.terminalLines, { ...line, id: uuid(), timestamp: Date.now() }],
  })),
  clearTerminal: () => set({ terminalLines: [] }),

  updateSettings: (updates) => set((s) => ({ settings: { ...s.settings, ...updates } })),
  updateMemory: (updates) => set((s) => ({ projectMemory: { ...s.projectMemory, ...updates } })),
}));

function toggleNode(nodes: FileNode[], path: string): FileNode[] {
  return nodes.map((n) => {
    if (n.path === path) return { ...n, expanded: !n.expanded };
    if (n.children) return { ...n, children: toggleNode(n.children, path) };
    return n;
  });
}
