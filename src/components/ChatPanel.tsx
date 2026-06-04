import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { sendMessage } from '../services/aiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  Send, StopCircle, Paperclip, Bot, User,
  Sparkles, Copy, Check, Trash2,
  Zap, MessageSquare, PenLine,
  Image as ImageIcon, FileText, AlertTriangle
} from 'lucide-react';

export function ChatPanel() {
  const {
    messages, isGenerating, agentMode, setAgentMode,
    addMessage, updateMessage, setIsGenerating,
    clearMessages, providers, activeProviderId,
  } = useStore();

  const [input, setInput] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeProvider = providers.find((p) => p.id === activeProviderId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userContent = input.trim();
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    addMessage({ role: 'user', content: userContent });
    setIsGenerating(true);

    const assistantId = addMessage({ role: 'assistant', content: '', isStreaming: true });
    abortRef.current = new AbortController();

    try {
      const allMessages = [...useStore.getState().messages.filter(m => m.id !== assistantId)];
      const result = await sendMessage(
        activeProvider || providers[0],
        allMessages,
        agentMode,
        (chunk) => {
          updateMessage(assistantId, { content: chunk });
        },
        abortRef.current.signal,
      );
      updateMessage(assistantId, { content: result, isStreaming: false });
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        updateMessage(assistantId, { isStreaming: false });
      } else {
        updateMessage(assistantId, {
          content: `❌ Error: ${(err as Error).message}`,
          isStreaming: false,
        });
      }
    } finally {
      setIsGenerating(false);
      abortRef.current = null;
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setIsGenerating(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTextareaInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  };

  const modeConfig = {
    ask: { icon: MessageSquare, label: 'Ask', color: 'text-[#a6e3a1]', bg: 'bg-[#a6e3a1]/10' },
    edit: { icon: PenLine, label: 'Edit', color: 'text-[#89b4fa]', bg: 'bg-[#89b4fa]/10' },
    agent: { icon: Zap, label: 'Agent', color: 'text-[#fab387]', bg: 'bg-[#fab387]/10' },
  };

  return (
    <div className="flex flex-col h-full bg-[#181825]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#313244]">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-[#f9e2af]" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#a6adc8]">
            AI Chat
          </span>
        </div>
        <div className="flex items-center gap-1">
          {/* Agent Mode Toggle */}
          <div className="flex bg-[#1e1e2e] rounded-lg p-0.5 border border-[#313244]">
            {(Object.entries(modeConfig) as [string, typeof modeConfig.ask][]).map(([mode, cfg]) => {
              const Icon = cfg.icon;
              return (
                <button
                  key={mode}
                  onClick={() => setAgentMode(mode as typeof agentMode)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
                    agentMode === mode ? `${cfg.bg} ${cfg.color}` : 'text-[#6c7086] hover:text-[#cdd6f4]'
                  }`}
                >
                  <Icon size={12} />
                  {cfg.label}
                </button>
              );
            })}
          </div>
          <button
            onClick={clearMessages}
            className="p-1.5 hover:bg-[#313244] rounded text-[#6c7086] hover:text-[#f38ba8] transition-colors"
            title="Clear chat"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Provider info */}
      <div className="px-3 py-1.5 border-b border-[#313244]/50 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#a6e3a1] animate-pulse" />
        <span className="text-[11px] text-[#6c7086]">
          {activeProvider?.name || 'No provider'} — {activeProvider?.model || 'No model'}
          {!activeProvider?.apiKey && activeProvider?.type !== 'local' ? ' (Demo Mode)' : ''}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#89b4fa] to-[#cba6f7] flex items-center justify-center mb-4 shadow-lg shadow-[#89b4fa]/20">
              <Bot size={32} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-[#cdd6f4] mb-2">DevAgent AI</h3>
            <p className="text-[13px] text-[#6c7086] max-w-[280px] mb-6">
              Your AI coding assistant with full project access. Ask me to edit files, fix bugs, or create features.
            </p>
            <div className="grid grid-cols-1 gap-2 w-full max-w-[300px]">
              {[
                'What can you do?',
                'Show project structure',
                'Add ESLint config',
                'Create a new component',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => { setInput(suggestion); textareaRef.current?.focus(); }}
                  className="text-left px-3 py-2 rounded-lg bg-[#1e1e2e] border border-[#313244] text-[12px] text-[#bac2de] hover:border-[#89b4fa] hover:text-[#cdd6f4] transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-[#89b4fa] to-[#cba6f7] flex items-center justify-center mt-1">
                <Bot size={14} className="text-white" />
              </div>
            )}
            <div className={`max-w-[85%] ${
              msg.role === 'user'
                ? 'bg-[#89b4fa]/20 border border-[#89b4fa]/30 rounded-2xl rounded-tr-sm px-3 py-2'
                : 'flex-1 min-w-0'
            }`}>
              {msg.role === 'user' ? (
                <p className="text-[13px] text-[#cdd6f4] whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <div className="prose prose-invert prose-sm max-w-none
                  prose-pre:bg-[#1e1e2e] prose-pre:border prose-pre:border-[#313244] prose-pre:rounded-lg
                  prose-code:text-[#f38ba8] prose-code:bg-[#1e1e2e] prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-[12px]
                  prose-headings:text-[#cdd6f4] prose-p:text-[#bac2de] prose-strong:text-[#cdd6f4]
                  prose-li:text-[#bac2de] prose-a:text-[#89b4fa]
                  prose-table:text-[#bac2de] prose-th:text-[#cdd6f4] prose-th:border-[#313244] prose-td:border-[#313244]
                  prose-hr:border-[#313244]
                  text-[13px]"
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        const codeString = String(children).replace(/\n$/, '');
                        if (match) {
                          return (
                            <div className="relative group/code not-prose">
                              <div className="flex items-center justify-between px-3 py-1.5 bg-[#11111b] border border-[#313244] border-b-0 rounded-t-lg">
                                <span className="text-[11px] text-[#6c7086]">{match[1]}</span>
                                <button
                                  onClick={() => handleCopy(msg.id + match[1], codeString)}
                                  className="text-[#6c7086] hover:text-[#cdd6f4] transition-colors"
                                >
                                  {copiedId === msg.id + match[1] ? <Check size={12} /> : <Copy size={12} />}
                                </button>
                              </div>
                              <SyntaxHighlighter
                                style={oneDark}
                                language={match[1]}
                                customStyle={{
                                  margin: 0,
                                  borderRadius: '0 0 0.5rem 0.5rem',
                                  fontSize: '12px',
                                  border: '1px solid #313244',
                                  borderTop: 'none',
                                  background: '#1e1e2e',
                                }}
                              >
                                {codeString}
                              </SyntaxHighlighter>
                            </div>
                          );
                        }
                        return <code className={className} {...props}>{children}</code>;
                      },
                    }}
                  >
                    {msg.content || (msg.isStreaming ? '●' : '')}
                  </ReactMarkdown>
                  {msg.isStreaming && (
                    <span className="inline-block w-2 h-4 bg-[#89b4fa] animate-pulse ml-1 rounded-sm" />
                  )}
                </div>
              )}

              {/* Message actions */}
              {msg.role === 'assistant' && !msg.isStreaming && msg.content && (
                <div className="flex items-center gap-1 mt-2">
                  <button
                    onClick={() => handleCopy(msg.id, msg.content)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-[#6c7086] hover:text-[#cdd6f4] hover:bg-[#313244] transition-colors"
                  >
                    {copiedId === msg.id ? <Check size={11} /> : <Copy size={11} />}
                    {copiedId === msg.id ? 'Copied' : 'Copy'}
                  </button>
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-[#45475a] flex items-center justify-center mt-1">
                <User size={14} className="text-[#cdd6f4]" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[#313244]">
        <div className="relative flex items-end bg-[#1e1e2e] border border-[#313244] rounded-xl focus-within:border-[#89b4fa] transition-colors">
          <div className="relative">
            <button
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className="p-2.5 text-[#6c7086] hover:text-[#cdd6f4] transition-colors"
              title="Attach file"
            >
              <Paperclip size={16} />
            </button>
            {showAttachMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowAttachMenu(false)} />
                <div className="absolute bottom-full left-0 mb-2 bg-[#1e1e2e] border border-[#313244] rounded-lg shadow-xl py-1 min-w-[180px] z-50">
                  <button className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-[#cdd6f4] hover:bg-[#313244]" onClick={() => setShowAttachMenu(false)}>
                    <FileText size={14} className="text-[#89b4fa]" /> Attach file
                  </button>
                  <button className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-[#cdd6f4] hover:bg-[#313244]" onClick={() => setShowAttachMenu(false)}>
                    <ImageIcon size={14} className="text-[#a6e3a1]" /> Screenshot
                  </button>
                  <button className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-[#cdd6f4] hover:bg-[#313244]" onClick={() => setShowAttachMenu(false)}>
                    <AlertTriangle size={14} className="text-[#f38ba8]" /> Paste stacktrace
                  </button>
                </div>
              </>
            )}
          </div>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); handleTextareaInput(); }}
            onKeyDown={handleKeyDown}
            placeholder={`Ask DevAgent AI (${modeConfig[agentMode].label} mode)...`}
            rows={1}
            className="flex-1 bg-transparent text-[13px] text-[#cdd6f4] placeholder-[#6c7086] py-2.5 pr-2 resize-none focus:outline-none max-h-[200px]"
          />
          {isGenerating ? (
            <button
              onClick={handleStop}
              className="p-2.5 text-[#f38ba8] hover:text-[#f38ba8]/80 transition-colors"
              title="Stop generation"
            >
              <StopCircle size={18} />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className={`p-2.5 transition-colors ${
                input.trim()
                  ? 'text-[#89b4fa] hover:text-[#89b4fa]/80'
                  : 'text-[#45475a]'
              }`}
              title="Send message"
            >
              <Send size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
