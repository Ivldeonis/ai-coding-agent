import { useState } from 'react';
import { useStore } from '../store';
import { useLanguage } from '../hooks/useLanguage';
import {
  Settings, Key, Server, Cpu, Globe, Shield,
  Plus, Trash2, Check, Eye, EyeOff,
  ToggleLeft, ToggleRight, Palette, Monitor, RefreshCw, AlertCircle
} from 'lucide-react';

export function SettingsPanel() {
  const {
    settings, updateSettings,
    providers, activeProviderId,
    updateProvider, removeProvider, addProvider, setActiveProvider,
  } = useStore();

  const { t } = useLanguage();

  const [activeSection, setActiveSection] = useState<'providers' | 'general' | 'security'>('providers');
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const [loadingModels, setLoadingModels] = useState<string | null>(null);
  const [modelError, setModelError] = useState<string | null>(null);

  const sections = [
    { id: 'providers' as const, icon: Server, label: t.settings.providers },
    { id: 'general' as const, icon: Settings, label: t.settings.general },
    { id: 'security' as const, icon: Shield, label: t.settings.security },
  ];

  const toggleKeyVisibility = (id: string) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddProvider = () => {
    addProvider({
      name: t.settings.newProvider,
      type: 'openai',
      baseUrl: 'https://api.openai.com/v1',
      apiKey: '',
      model: 'gpt-4o',
    });
  };

  const loadModels = async (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    if (!provider || !provider.apiKey) {
      setModelError(t.settings.failedLoadModels);
      return;
    }

    setLoadingModels(providerId);
    setModelError(null);

    try {
      let url = '';
      let headers: Record<string, string> = {};

      // Определяем URL и заголовки в зависимости от провайдера
      switch (provider.type) {
        case 'openai':
          url = `${provider.baseUrl}/models`;
          headers = { 'Authorization': `Bearer ${provider.apiKey}` };
          break;
        case 'openrouter':
          url = 'https://openrouter.ai/api/v1/models';
          headers = { 'Authorization': `Bearer ${provider.apiKey}` };
          break;
        case 'gemini':
          // Gemini использует GET параметры
          url = `${provider.baseUrl}/models?key=${provider.apiKey}`;
          break;
        case 'local':
          url = `${provider.baseUrl}/models`;
          break;
        default:
          throw new Error('Unknown provider type');
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: Object.keys(headers).length > 0 ? headers : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      let models: string[] = [];

      // Парсим ответ в зависимости от типа провайдера
      if (provider.type === 'openai') {
        models = data.data
          .filter((m: any) => m.id.includes('gpt') || m.id.includes('o1'))
          .map((m: any) => m.id)
          .sort();
      } else if (provider.type === 'openrouter') {
        models = data.data
          .map((m: any) => m.id)
          .sort();
      } else if (provider.type === 'gemini') {
        models = data.models
          .map((m: any) => m.name.split('/').pop())
          .filter((m: string) => m?.includes('gemini'))
          .sort();
      } else if (provider.type === 'local') {
        // Ollama возвращает models как массив объектов
        if (Array.isArray(data.models)) {
          models = data.models.map((m: any) => m.name || m).sort();
        }
      }

      if (models.length > 0) {
        updateProvider(providerId, { models });
      } else {
        throw new Error('No models found');
      }
    } catch (error) {
      console.error('Failed to load models:', error);
      setModelError(`${t.settings.failedLoadModels}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoadingModels(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#181825]">
      <div className="px-3 py-2 border-b border-[#313244]">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#a6adc8]">
          {t.settings.title}
        </span>
      </div>

      {/* Section tabs */}
      <div className="flex border-b border-[#313244]">
        {sections.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-[12px] transition-colors border-b-2 ${
              activeSection === id
                ? 'text-[#89b4fa] border-[#89b4fa]'
                : 'text-[#6c7086] border-transparent hover:text-[#cdd6f4]'
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {activeSection === 'providers' && (
          <>
            {providers.map((provider) => (
              <div
                key={provider.id}
                className={`p-3 rounded-lg border transition-colors ${
                  provider.id === activeProviderId
                    ? 'bg-[#89b4fa]/5 border-[#89b4fa]/30'
                    : 'bg-[#1e1e2e] border-[#313244]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {provider.type === 'openai' && <Globe size={14} className="text-[#a6e3a1]" />}
                    {provider.type === 'openrouter' && <Server size={14} className="text-[#cba6f7]" />}
                    {provider.type === 'gemini' && <Sparkle className="text-[#89b4fa]" />}
                    {provider.type === 'local' && <Cpu size={14} className="text-[#fab387]" />}
                    <span className="text-[13px] font-medium text-[#cdd6f4]">{provider.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#313244] text-[#6c7086]">
                      {provider.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {provider.id !== activeProviderId && (
                      <button
                        onClick={() => setActiveProvider(provider.id)}
                        className="flex items-center gap-1 px-2 py-0.5 text-[11px] bg-[#89b4fa]/10 text-[#89b4fa] rounded hover:bg-[#89b4fa]/20"
                      >
                        <Check size={10} /> {t.settings.use}
                      </button>
                    )}
                    {provider.id === activeProviderId && (
                      <span className="flex items-center gap-1 px-2 py-0.5 text-[11px] bg-[#a6e3a1]/10 text-[#a6e3a1] rounded">
                        <Check size={10} /> {t.settings.active}
                      </span>
                    )}
                    <button
                      onClick={() => setEditingProvider(editingProvider === provider.id ? null : provider.id)}
                      className="p-1 hover:bg-[#313244] rounded text-[#6c7086] hover:text-[#cdd6f4]"
                    >
                      <Settings size={12} />
                    </button>
                  </div>
                </div>

                {editingProvider === provider.id && (
                  <div className="space-y-2 mt-3 pt-3 border-t border-[#313244]">
                    <div>
                      <label className="text-[11px] text-[#6c7086] mb-1 block">{t.settings.name}</label>
                      <input
                        type="text"
                        value={provider.name}
                        onChange={(e) => updateProvider(provider.id, { name: e.target.value })}
                        className="w-full bg-[#11111b] border border-[#313244] rounded px-2 py-1.5 text-[12px] text-[#cdd6f4] focus:border-[#89b4fa] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#6c7086] mb-1 block">{t.settings.baseUrl}</label>
                      <input
                        type="text"
                        value={provider.baseUrl}
                        onChange={(e) => updateProvider(provider.id, { baseUrl: e.target.value })}
                        className="w-full bg-[#11111b] border border-[#313244] rounded px-2 py-1.5 text-[12px] text-[#cdd6f4] focus:border-[#89b4fa] focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#6c7086] mb-1 block">{t.settings.apiKey}</label>
                      <div className="flex items-center gap-1">
                        <input
                          type={showKeys[provider.id] ? 'text' : 'password'}
                          value={provider.apiKey}
                          onChange={(e) => updateProvider(provider.id, { apiKey: e.target.value })}
                          placeholder="sk-..."
                          className="flex-1 bg-[#11111b] border border-[#313244] rounded px-2 py-1.5 text-[12px] text-[#cdd6f4] focus:border-[#89b4fa] focus:outline-none font-mono"
                        />
                        <button
                          onClick={() => toggleKeyVisibility(provider.id)}
                          className="p-1.5 hover:bg-[#313244] rounded text-[#6c7086]"
                        >
                          {showKeys[provider.id] ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] text-[#6c7086]">{t.settings.models}</label>
                        <button
                          onClick={() => loadModels(provider.id)}
                          disabled={loadingModels === provider.id || !provider.apiKey}
                          className="flex items-center gap-1 px-2 py-0.5 text-[10px] bg-[#89b4fa]/10 text-[#89b4fa] rounded hover:bg-[#89b4fa]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <RefreshCw size={10} className={loadingModels === provider.id ? 'animate-spin' : ''} />
                          {t.settings.loadModels}
                        </button>
                      </div>

                      {modelError && (
                        <div className="flex items-center gap-2 px-2 py-1.5 mb-2 bg-[#f38ba8]/10 border border-[#f38ba8]/30 rounded text-[10px] text-[#f38ba8]">
                          <AlertCircle size={12} />
                          {modelError}
                        </div>
                      )}

                      <select
                        value={provider.model}
                        onChange={(e) => updateProvider(provider.id, { model: e.target.value })}
                        className="w-full bg-[#11111b] border border-[#313244] rounded px-2 py-1.5 text-[12px] text-[#cdd6f4] focus:border-[#89b4fa] focus:outline-none"
                      >
                        {provider.models && provider.models.length > 0 ? (
                          provider.models.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))
                        ) : (
                          <option value={provider.model}>{provider.model}</option>
                        )}
                      </select>
                    </div>

                    <button
                      onClick={() => removeProvider(provider.id)}
                      className="flex items-center gap-1 text-[11px] text-[#f38ba8] hover:text-[#f38ba8]/80 mt-2"
                    >
                      <Trash2 size={11} /> {t.settings.removeProvider}
                    </button>
                  </div>
                )}
              </div>
            ))}

            <button
              onClick={handleAddProvider}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-[#313244] text-[12px] text-[#6c7086] hover:text-[#cdd6f4] hover:border-[#89b4fa] transition-colors"
            >
              <Plus size={14} /> {t.settings.addProvider}
            </button>
          </>
        )}

        {activeSection === 'general' && (
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-[13px] text-[#cdd6f4] mb-2">
                <Palette size={14} /> {t.settings.theme}
              </label>
              <div className="flex gap-2">
                {(['dark', 'light', 'system'] as const).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => updateSettings({ theme })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] border transition-colors ${
                      settings.theme === theme
                        ? 'bg-[#89b4fa]/10 border-[#89b4fa]/30 text-[#89b4fa]'
                        : 'bg-[#1e1e2e] border-[#313244] text-[#6c7086] hover:text-[#cdd6f4]'
                    }`}
                  >
                    {theme === 'system' && <Monitor size={12} />}
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[13px] text-[#cdd6f4] mb-2 block">
                {t.settings.fontSize}: {settings.fontSize}px
              </label>
              <input
                type="range"
                min={10}
                max={24}
                value={settings.fontSize}
                onChange={(e) => updateSettings({ fontSize: Number(e.target.value) })}
                className="w-full accent-[#89b4fa]"
              />
            </div>

            <div>
              <label className="text-[13px] text-[#cdd6f4] mb-2 block">
                {t.settings.autoSaveDelay}: {settings.autoSaveInterval}ms
              </label>
              <input
                type="range"
                min={500}
                max={5000}
                step={500}
                value={settings.autoSaveInterval}
                onChange={(e) => updateSettings({ autoSaveInterval: Number(e.target.value) })}
                className="w-full accent-[#89b4fa]"
              />
            </div>
          </div>
        )}

        {activeSection === 'security' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-[#1e1e2e] rounded-lg border border-[#313244]">
              <div>
                <p className="text-[13px] text-[#cdd6f4]">{t.settings.autoConfirm}</p>
                <p className="text-[11px] text-[#6c7086] mt-0.5">{t.settings.autoConfirmDesc}</p>
              </div>
              <button
                onClick={() => updateSettings({ autoConfirm: !settings.autoConfirm })}
                className="text-[#6c7086]"
              >
                {settings.autoConfirm
                  ? <ToggleRight size={24} className="text-[#f38ba8]" />
                  : <ToggleLeft size={24} />
                }
              </button>
            </div>

            {settings.autoConfirm && (
              <div className="flex items-center gap-2 px-3 py-2 bg-[#f38ba8]/10 border border-[#f38ba8]/30 rounded-lg">
                <Shield size={14} className="text-[#f38ba8]" />
                <span className="text-[12px] text-[#f38ba8]">
                  ⚠️ Автоподтверждение включено. AI может изменять файлы без проверки.
                </span>
              </div>
            )}

            <div>
              <label className="text-[13px] text-[#cdd6f4] mb-2 block">
                <Key size={14} className="inline mr-1" />
                {t.settings.terminalWhitelist}
              </label>
              <div className="flex flex-wrap gap-1">
                {settings.terminalWhitelist.map((cmd) => (
                  <span key={cmd} className="px-2 py-0.5 bg-[#1e1e2e] border border-[#313244] rounded text-[11px] text-[#bac2de] font-mono">
                    {cmd}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[13px] text-[#cdd6f4] mb-2 block">
                {t.settings.safeCommands}
              </label>
              <div className="flex flex-wrap gap-1">
                {settings.safeCommands.map((cmd) => (
                  <span key={cmd} className="px-2 py-0.5 bg-[#a6e3a1]/10 border border-[#a6e3a1]/20 rounded text-[11px] text-[#a6e3a1] font-mono">
                    {cmd}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Sparkle({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
    </svg>
  );
}
