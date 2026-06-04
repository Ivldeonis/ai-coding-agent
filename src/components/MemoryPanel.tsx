import { useState } from 'react';
import { useStore } from '../store';
import { Brain, Plus, X, Save, Code2, FileJson, BookOpen, Cpu } from 'lucide-react';

export function MemoryPanel() {
  const { projectMemory, updateMemory } = useStore();
  const [newRule, setNewRule] = useState('');
  const [newEnvKey, setNewEnvKey] = useState('');
  const [newEnvVal, setNewEnvVal] = useState('');

  const addRule = () => {
    if (!newRule.trim()) return;
    updateMemory({ rules: [...projectMemory.rules, newRule.trim()] });
    setNewRule('');
  };

  const removeRule = (index: number) => {
    updateMemory({ rules: projectMemory.rules.filter((_, i) => i !== index) });
  };

  const addEnvVar = () => {
    if (!newEnvKey.trim()) return;
    updateMemory({ envVars: { ...projectMemory.envVars, [newEnvKey.trim()]: newEnvVal } });
    setNewEnvKey('');
    setNewEnvVal('');
  };

  const removeEnvVar = (key: string) => {
    const next = { ...projectMemory.envVars };
    delete next[key];
    updateMemory({ envVars: next });
  };

  return (
    <div className="flex flex-col h-full bg-[#181825]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#313244]">
        <div className="flex items-center gap-2">
          <Brain size={14} className="text-[#cba6f7]" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#a6adc8]">
            Project Memory
          </span>
        </div>
        <button className="flex items-center gap-1 px-2 py-0.5 text-[11px] bg-[#a6e3a1]/10 text-[#a6e3a1] rounded hover:bg-[#a6e3a1]/20">
          <Save size={11} /> Save
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Coding Rules */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Code2 size={13} className="text-[#89b4fa]" />
            <span className="text-[12px] font-medium text-[#cdd6f4]">Coding Rules</span>
          </div>
          <div className="space-y-1">
            {projectMemory.rules.map((rule, i) => (
              <div key={i} className="flex items-start gap-2 px-2 py-1.5 bg-[#1e1e2e] rounded border border-[#313244] group">
                <span className="text-[12px] text-[#bac2de] flex-1">{rule}</span>
                <button
                  onClick={() => removeRule(i)}
                  className="opacity-0 group-hover:opacity-100 text-[#f38ba8] hover:text-[#f38ba8]/80 transition-opacity flex-shrink-0"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-1 mt-1.5">
            <input
              type="text"
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addRule()}
              placeholder="Add new rule..."
              className="flex-1 bg-[#1e1e2e] border border-[#313244] rounded px-2 py-1 text-[12px] text-[#cdd6f4] placeholder-[#6c7086] focus:border-[#89b4fa] focus:outline-none"
            />
            <button onClick={addRule} className="p-1.5 bg-[#89b4fa]/10 text-[#89b4fa] rounded hover:bg-[#89b4fa]/20">
              <Plus size={12} />
            </button>
          </div>
        </div>

        {/* Environment Variables */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileJson size={13} className="text-[#f9e2af]" />
            <span className="text-[12px] font-medium text-[#cdd6f4]">Environment Variables</span>
          </div>
          <div className="space-y-1">
            {Object.entries(projectMemory.envVars).map(([key, val]) => (
              <div key={key} className="flex items-center gap-2 px-2 py-1.5 bg-[#1e1e2e] rounded border border-[#313244] group">
                <span className="text-[11px] text-[#89b4fa] font-mono">{key}</span>
                <span className="text-[#6c7086] text-[10px]">=</span>
                <span className="text-[11px] text-[#a6e3a1] font-mono flex-1 truncate">{val}</span>
                <button
                  onClick={() => removeEnvVar(key)}
                  className="opacity-0 group-hover:opacity-100 text-[#f38ba8]"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-1 mt-1.5">
            <input
              type="text"
              value={newEnvKey}
              onChange={(e) => setNewEnvKey(e.target.value)}
              placeholder="KEY"
              className="w-24 bg-[#1e1e2e] border border-[#313244] rounded px-2 py-1 text-[12px] text-[#cdd6f4] placeholder-[#6c7086] focus:border-[#89b4fa] focus:outline-none font-mono"
            />
            <input
              type="text"
              value={newEnvVal}
              onChange={(e) => setNewEnvVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addEnvVar()}
              placeholder="value"
              className="flex-1 bg-[#1e1e2e] border border-[#313244] rounded px-2 py-1 text-[12px] text-[#cdd6f4] placeholder-[#6c7086] focus:border-[#89b4fa] focus:outline-none font-mono"
            />
            <button onClick={addEnvVar} className="p-1.5 bg-[#89b4fa]/10 text-[#89b4fa] rounded hover:bg-[#89b4fa]/20">
              <Plus size={12} />
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={13} className="text-[#cba6f7]" />
            <span className="text-[12px] font-medium text-[#cdd6f4]">System Instructions</span>
          </div>
          <textarea
            value={projectMemory.instructions}
            onChange={(e) => updateMemory({ instructions: e.target.value })}
            rows={3}
            className="w-full bg-[#1e1e2e] border border-[#313244] rounded px-2 py-1.5 text-[12px] text-[#cdd6f4] placeholder-[#6c7086] focus:border-[#89b4fa] focus:outline-none resize-none"
            placeholder="Instructions always added to system prompt..."
          />
        </div>

        {/* Architecture */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Cpu size={13} className="text-[#fab387]" />
            <span className="text-[12px] font-medium text-[#cdd6f4]">Architecture Notes</span>
          </div>
          <textarea
            value={projectMemory.architecture}
            onChange={(e) => updateMemory({ architecture: e.target.value })}
            rows={3}
            className="w-full bg-[#1e1e2e] border border-[#313244] rounded px-2 py-1.5 text-[12px] text-[#cdd6f4] placeholder-[#6c7086] focus:border-[#89b4fa] focus:outline-none resize-none"
            placeholder="Notes about project architecture..."
          />
        </div>

        {/* .ai-memory.json preview */}
        <div className="p-3 bg-[#11111b] rounded-lg border border-[#313244]">
          <div className="flex items-center gap-2 mb-2">
            <FileJson size={13} className="text-[#6c7086]" />
            <span className="text-[11px] text-[#6c7086]">.ai-memory.json preview</span>
          </div>
          <pre className="text-[10px] text-[#6c7086] font-mono overflow-x-auto">
            {JSON.stringify(projectMemory, null, 2).substring(0, 500)}...
          </pre>
        </div>
      </div>
    </div>
  );
}
