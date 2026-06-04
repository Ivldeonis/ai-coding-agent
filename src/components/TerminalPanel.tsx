import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { Terminal, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function TerminalPanel() {
  const { terminalLines, addTerminalLine, clearTerminal, settings } = useStore();
  const [input, setInput] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingCommand, setPendingCommand] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [terminalLines]);

  const isSafeCommand = (cmd: string) => {
    return settings.safeCommands.some(safe =>
      cmd.trim().startsWith(safe)
    );
  };

  const isWhitelisted = (cmd: string) => {
    const binary = cmd.trim().split(' ')[0];
    return settings.terminalWhitelist.includes(binary);
  };

  const executeCommand = (cmd: string) => {
    addTerminalLine({ type: 'input', content: `$ ${cmd}` });

    // Simulate command outputs
    const trimmed = cmd.trim();
    if (trimmed === 'help') {
      addTerminalLine({ type: 'system', content: 'Available commands:' });
      addTerminalLine({ type: 'system', content: '  help          — Show this help' });
      addTerminalLine({ type: 'system', content: '  clear         — Clear terminal' });
      addTerminalLine({ type: 'system', content: '  ls            — List files' });
      addTerminalLine({ type: 'system', content: '  pwd           — Current directory' });
      addTerminalLine({ type: 'system', content: '  git status    — Git status' });
      addTerminalLine({ type: 'system', content: '  npm install   — Install dependencies' });
      addTerminalLine({ type: 'system', content: '  npm run build — Build project' });
    } else if (trimmed === 'clear') {
      clearTerminal();
    } else if (trimmed === 'pwd') {
      addTerminalLine({ type: 'output', content: '/storage/emulated/0/Projects/my-app' });
    } else if (trimmed === 'ls') {
      addTerminalLine({ type: 'output', content: 'src/  node_modules/  package.json  tsconfig.json  vite.config.ts  .gitignore  README.md' });
    } else if (trimmed === 'ls src' || trimmed === 'ls src/') {
      addTerminalLine({ type: 'output', content: 'App.tsx  main.tsx  index.css  components/  hooks/' });
    } else if (trimmed === 'git status') {
      addTerminalLine({ type: 'output', content: 'On branch main' });
      addTerminalLine({ type: 'output', content: 'Changes not staged for commit:' });
      addTerminalLine({ type: 'output', content: '  modified:   src/App.tsx' });
      addTerminalLine({ type: 'output', content: '  modified:   package.json' });
      addTerminalLine({ type: 'output', content: '' });
      addTerminalLine({ type: 'output', content: 'Untracked files:' });
      addTerminalLine({ type: 'output', content: '  .eslintrc.json' });
    } else if (trimmed === 'git branch') {
      addTerminalLine({ type: 'output', content: '* main' });
      addTerminalLine({ type: 'output', content: '  feature/auth' });
      addTerminalLine({ type: 'output', content: '  develop' });
    } else if (trimmed === 'git log' || trimmed.startsWith('git log')) {
      addTerminalLine({ type: 'output', content: 'commit a1b2c3d (HEAD -> main)' });
      addTerminalLine({ type: 'output', content: 'Author: Developer <dev@example.com>' });
      addTerminalLine({ type: 'output', content: 'Date:   Mon Jan 15 2024' });
      addTerminalLine({ type: 'output', content: '    Initial commit' });
    } else if (trimmed.startsWith('npm install') || trimmed.startsWith('npm i')) {
      addTerminalLine({ type: 'output', content: 'added 127 packages in 8.2s' });
      addTerminalLine({ type: 'output', content: '' });
      addTerminalLine({ type: 'output', content: '45 packages are looking for funding' });
      addTerminalLine({ type: 'output', content: '  run `npm fund` for details' });
    } else if (trimmed === 'npm run build') {
      addTerminalLine({ type: 'output', content: '> my-app@0.1.0 build' });
      addTerminalLine({ type: 'output', content: '> vite build' });
      addTerminalLine({ type: 'output', content: '' });
      addTerminalLine({ type: 'output', content: 'vite v5.0.0 building for production...' });
      addTerminalLine({ type: 'output', content: '✓ 42 modules transformed.' });
      addTerminalLine({ type: 'output', content: 'dist/index.html    0.45 kB │ gzip:  0.29 kB' });
      addTerminalLine({ type: 'output', content: 'dist/assets/index-BqeF2x4k.js    186.23 kB │ gzip: 59.87 kB' });
      addTerminalLine({ type: 'output', content: '✓ built in 2.14s' });
    } else if (trimmed === 'npm run dev') {
      addTerminalLine({ type: 'output', content: '> my-app@0.1.0 dev' });
      addTerminalLine({ type: 'output', content: '> vite' });
      addTerminalLine({ type: 'output', content: '' });
      addTerminalLine({ type: 'output', content: '  VITE v5.0.0  ready in 284 ms' });
      addTerminalLine({ type: 'output', content: '' });
      addTerminalLine({ type: 'output', content: '  ➜  Local:   http://localhost:5173/' });
      addTerminalLine({ type: 'output', content: '  ➜  Network: http://192.168.1.100:5173/' });
    } else if (!isWhitelisted(trimmed)) {
      addTerminalLine({ type: 'error', content: `⛔ Command "${trimmed.split(' ')[0]}" is not in the whitelist.` });
      addTerminalLine({ type: 'system', content: `Allowed: ${settings.terminalWhitelist.join(', ')}` });
    } else {
      addTerminalLine({ type: 'output', content: `Command executed: ${trimmed}` });
    }
  };

  const handleSubmit = () => {
    if (!input.trim()) return;
    const cmd = input.trim();
    setInput('');

    if (isSafeCommand(cmd) || settings.autoConfirm) {
      executeCommand(cmd);
    } else {
      setPendingCommand(cmd);
      setShowConfirm(true);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#181825]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#313244]">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-[#a6e3a1]" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#a6adc8]">
            Terminal
          </span>
        </div>
        <button onClick={clearTerminal} className="p-1 hover:bg-[#313244] rounded text-[#6c7086] hover:text-[#cdd6f4]">
          <Trash2 size={13} />
        </button>
      </div>

      {/* Confirm modal */}
      {showConfirm && (
        <div className="mx-2 mt-2 p-3 bg-[#1e1e2e] border border-[#f9e2af]/40 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} className="text-[#f9e2af]" />
            <span className="text-[12px] font-medium text-[#f9e2af]">Confirm command execution</span>
          </div>
          <code className="block text-[12px] text-[#cdd6f4] bg-[#11111b] px-2 py-1 rounded mb-2 font-mono">
            $ {pendingCommand}
          </code>
          <div className="flex gap-2">
            <button
              onClick={() => { executeCommand(pendingCommand); setShowConfirm(false); }}
              className="flex items-center gap-1 px-3 py-1 text-[12px] bg-[#a6e3a1]/20 text-[#a6e3a1] rounded hover:bg-[#a6e3a1]/30"
            >
              <CheckCircle2 size={12} /> Execute
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="px-3 py-1 text-[12px] bg-[#313244] text-[#cdd6f4] rounded hover:bg-[#45475a]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Output */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 font-mono text-[12px]">
        {terminalLines.map((line) => (
          <div key={line.id} className={`leading-relaxed ${
            line.type === 'input' ? 'text-[#a6e3a1]' :
            line.type === 'error' ? 'text-[#f38ba8]' :
            line.type === 'system' ? 'text-[#89b4fa]' :
            'text-[#cdd6f4]'
          }`}>
            {line.content}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-3 py-2 border-t border-[#313244]">
        <span className="text-[#a6e3a1] text-[12px] font-mono">$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="Type command..."
          className="flex-1 bg-transparent text-[12px] text-[#cdd6f4] placeholder-[#6c7086] focus:outline-none font-mono"
        />
      </div>
    </div>
  );
}
