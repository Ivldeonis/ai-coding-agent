import { useState } from 'react';
import { useStore } from '../store';
import { fetchModels } from '../services/aiService';
import {
  Settings, Bot, Palette, Shield,
  Plus, Trash2, Check, Eye, EyeOff,
  Monitor, Key, ToggleLeft, ToggleRight,
  RefreshCw, Globe
} from 'lucide-react';

export function SettingsPanel() {
  const {
    providers, activeProviderId, updateProvider,
    removeProvider, addProvider, setActiveProvider,
    settings, updateSettings, t
  } = useStore();

  const [activeSection, setActiveSection] = useState<'providers' | 'general' | 'security'>('providers');
  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [isFetchingModels, setIsFetchingModels] = useState<string | null>(null);

  const toggleKeyVisibility = (id: string) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddProvider = () => {
    addProvider({
      name: 'New Provider',
      type: 'openai',
      baseUrl: 'https://api.openai.com/v1',
      apiKey: '',
      model: 'gpt-4o',
      models: ['gpt-4o', 'gpt-4o-mini']
    });
  };

  const handleFetchModels = async (id: string) => {
    const provider = providers.find(p => p.id === id);
    if (!provider || !provider.apiKey) return;

    setIsFetchingModels(id);
    try {
      const models = await fetchModels(provider);
      if (models.length > 0) {
        updateProvider(id, { models, model: models[0] });
      }
    } catch (error) {
      console.error('Failed to fetch models:', error);
    } finally {
      setIsFetchingModels(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#181825]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#313244]">
        <h2 className="text-[14px] font-semibold text-[#cdd6f4] flex items-center gap-2">
          <Settings size={16} /> {t('common.settings')}
        </h2>
      </div>

      <div className="flex border-b border-[#313244] px-2">
        <button
          onClick={() => setActiveSection('providers')}
          className={`px-3 py-2 text-[12px] border-b-2 transition-colors ${
            activeSection === 'providers'
              ? 'text-[#89b4fa] border-[#89b4fa]'
              : 'text-[#6c7086] border-transparent hover:text-[#cdd6f4]'
          }`}
        >
          {t('settings.aiProviders')}
        </button>
        <button
          onClick={() => setActiveSection('general')}
          className={`px-3 py-2 text-[12px] border-b-2 transition-colors ${
            activeSection === 'general'
              ? 'text-[#89b4fa] border-[#89b4fa]'
              : 'text-[#6c7086] border-transparent hover:text-[#cdd6f4]'
          }`}
        >
          {t('settings.general')}
        </button>
        <button
          onClick={() => setActiveSection('security')}
          className={`px-3 py-2 text-[12px] border-b-2 transition-colors ${
            activeSection === 'security'
              ? 'text-[#89b4fa] border-[#89b4fa]'
              : 'text-[#6c7086] border-transparent hover:text-[#cdd6f4]'
          }`}
        >
          {t('settings.security')}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activeSection === 'providers' && (
          <>
            {providers.map((provider) => (
              <div key={provider.id} className="bg-[#1e1e2e] rounded-lg border border-[#313244] p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Bot size={16} className="text-[#89b4fa]" />
                    <div>
                      <h3 className="text-[13px] font-medium text-[#cdd6f4]">{provider.name}</h3>
                      <p className="text-[11px] text-[#6c7086]">{provider.model}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {provider.id !== activeProviderId && (
                      <button
                        onClick={() => setActiveProvider(provider.id)}
                        className="flex items-center gap-1 px-2 py-0.5 text-[11px] bg-[#89b4fa]/10 text-[#89b4fa] rounded hover:bg-[#89b4fa]/20"
                      >
                        <Check size={10} /> {t('common.use')}
                      </button>
                    )}
                    {provider.id === activeProviderId && (
                      <span className="flex items-center gap-1 px-2 py-0.5 text-[11px] bg-[#a6e3a1]/10 text-[#a6e3a1] rounded">
                        <Check size={10} /> {t('common.active')}
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
                      <label className="text-[11px] text-[#6c7086] mb-1 block">{t('settings.name')}</label>
                      <input
                        type="text"
                        value={provider.name}
                        onChange={(e) => updateProvider(provider.id, { name: e.target.value })}
                        className="w-full bg-[#11111b] border border-[#313244] rounded px-2 py-1.5 text-[12px] text-[#cdd6f4] focus:border-[#89b4fa] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#6c7086] mb-1 block">{t('settings.baseUrl')}</label>
                      <input
                        type="text"
                        value={provider.baseUrl}
                        onChange={(e) => updateProvider(provider.id, { baseUrl: e.target.value })}
                        className="w-full bg-[#11111b] border border-[#313244] rounded px-2 py-1.5 text-[12px] text-[#cdd6f4] focus:border-[#89b4fa] focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#6c7086] mb-1 block">{t('settings.apiKey')}</label>
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
                      <label className="text-[11px] text-[#6c7086] mb-1 block">{t('settings.model')}</label>
                      <div className="flex gap-1">
                        <select
                          value={provider.model}
                          onChange={(e) => updateProvider(provider.id, { model: e.target.value })}
                          className="flex-1 bg-[#11111b] border border-[#313244] rounded px-2 py-1.5 text-[12px] text-[#cdd6f4] focus:border-[#89b4fa] focus:outline-none"
                        >
                          {provider.models?.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleFetchModels(provider.id)}
                          disabled={isFetchingModels === provider.id || !provider.apiKey}
                          className="p-1.5 bg-[#89b4fa]/10 text-[#89b4fa] rounded hover:bg-[#89b4fa]/20 disabled:opacity-50"
                          title={t('settings.fetchModels')}
                        >
                          <RefreshCw size={14} className={isFetchingModels === provider.id ? 'animate-spin' : ''} />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeProvider(provider.id)}
                      className="flex items-center gap-1 text-[11px] text-[#f38ba8] hover:text-[#f38ba8]/80 mt-2"
                    >
                      <Trash2 size={11} /> {t('settings.removeProvider')}
                    </button>
                  </div>
                )}
              </div>
            ))}

            <button
              onClick={handleAddProvider}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-[#313244] text-[12px] text-[#6c7086] hover:text-[#cdd6f4] hover:border-[#89b4fa] transition-colors"
            >
              <Plus size={14} /> {t('settings.addProvider')}
            </button>
          </>
        )}

        {activeSection === 'general' && (
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-[13px] text-[#cdd6f4] mb-2">
                <Globe size={14} /> Language / Язык
              </label>
              <div className="flex gap-2">
                {(['en', 'ru'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => updateSettings({ language: lang })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] border transition-colors ${
                      settings.language === lang
                        ? 'bg-[#89b4fa]/10 border-[#89b4fa]/30 text-[#89b4fa]'
                        : 'bg-[#1e1e2e] border-[#313244] text-[#6c7086] hover:text-[#cdd6f4]'
                    }`}
                  >
                    {lang === 'en' ? 'English' : 'Русский'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-[13px] text-[#cdd6f4] mb-2">
                <Palette size={14} /> {t('settings.theme')}
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
                {t('settings.fontSize')}: {settings.fontSize}px
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
                {t('settings.autoSave')}: {settings.autoSaveInterval}ms
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
                <p className="text-[13px] text-[#cdd6f4]">{t('settings.autoConfirm')}</p>
                <p className="text-[11px] text-[#6c7086] mt-0.5">{t('settings.autoConfirmDesc')}</p>
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
                  ⚠️ Auto-confirm is enabled. AI can modify files without review.
                </span>
              </div>
            )}

            <div>
              <label className="text-[13px] text-[#cdd6f4] mb-2 block">
                <Key size={14} className="inline mr-1" />
                {t('settings.terminalWhitelist')}
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
                {t('settings.safeCommands')}
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
