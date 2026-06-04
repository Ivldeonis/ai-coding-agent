export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  attachments?: Attachment[];
  toolCalls?: ToolCall[];
  isStreaming?: boolean;
}

export interface Attachment {
  name: string;
  type: 'file' | 'image' | 'log' | 'stacktrace';
  content: string;
  language?: string;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'error';
}

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  expanded?: boolean;
}

export interface EditorTab {
  id: string;
  path: string;
  name: string;
  content: string;
  savedContent: string;
  language: string;
  isModified: boolean;
}

export interface DiffChange {
  id: string;
  path: string;
  oldContent: string;
  newContent: string;
  status: 'pending' | 'approved' | 'rejected' | 'edited';
  type: 'create' | 'modify' | 'delete' | 'rename';
  newPath?: string;
}

export interface AIProvider {
  id: string;
  name: string;
  type: 'openai' | 'openrouter' | 'gemini' | 'local';
  baseUrl: string;
  apiKey: string;
  model: string;
  models?: string[];
}

export type AgentMode = 'ask' | 'edit' | 'agent';

export interface ProjectMemory {
  rules: string[];
  envVars: Record<string, string>;
  instructions: string;
  architecture: string;
}

export interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'system';
  content: string;
  timestamp: number;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  autoConfirm: boolean;
  autoSaveInterval: number;
  maxRecentProjects: number;
  terminalWhitelist: string[];
  safeCommands: string[];
  fontSize: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  autoConfirm: false,
  autoSaveInterval: 1000,
  maxRecentProjects: 10,
  terminalWhitelist: ['npm', 'bun', 'pip', 'git', 'python', 'npx', 'node', 'ls', 'cat', 'echo', 'mkdir'],
  safeCommands: ['git status', 'git log', 'git branch', 'ls', 'pwd', 'cat', 'echo'],
  fontSize: 14,
};

export const AGENT_TOOLS = [
  { name: 'read_file', description: 'Read file contents', params: ['path', 'start_line?', 'end_line?'] },
  { name: 'write_file', description: 'Write content to existing file', params: ['path', 'content'] },
  { name: 'create_file', description: 'Create a new file', params: ['path', 'content'] },
  { name: 'delete_file', description: 'Delete a file', params: ['path'] },
  { name: 'rename_file', description: 'Rename/move a file', params: ['old_path', 'new_path'] },
  { name: 'search_files', description: 'Search files by name pattern', params: ['pattern'] },
  { name: 'search_code', description: 'Search code content', params: ['query', 'file_pattern?'] },
  { name: 'create_folder', description: 'Create a folder', params: ['path'] },
  { name: 'get_project_tree', description: 'Get project directory tree', params: ['max_depth?'] },
  { name: 'run_command', description: 'Run a terminal command', params: ['command', 'cwd?'] },
] as const;
