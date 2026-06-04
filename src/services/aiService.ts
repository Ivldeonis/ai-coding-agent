import { ChatMessage, AIProvider } from '../types';

const SYSTEM_PROMPT = `You are DevAgent AI, an expert software engineer assistant.
You have access to the user's project files and can help with coding, debugging, and project management.
Follow the user's instructions carefully and provide high-quality code and explanations.`;

const DEMO_FILES: Record<string, string> = {
  'src/App.tsx': `import React from 'react';\n\nexport default function App() {\n  return <div>Hello World</div>;\n}`,
  'package.json': `{\n  "name": "my-app",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0"\n  }\n}`,
};

export async function fetchModels(provider: AIProvider): Promise<string[]> {
  if (!provider.apiKey && provider.type !== 'local') return [];

  try {
    let url = '';
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };

    if (provider.type === 'openai') {
      url = 'https://api.openai.com/v1/models';
      headers['Authorization'] = `Bearer ${provider.apiKey}`;
    } else if (provider.type === 'openrouter') {
      url = 'https://openrouter.ai/api/v1/models';
      headers['Authorization'] = `Bearer ${provider.apiKey}`;
    } else if (provider.type === 'gemini') {
      url = `https://generativelanguage.googleapis.com/v1beta/models?key=${provider.apiKey}`;
    } else if (provider.type === 'local') {
      url = `${provider.baseUrl.replace('/v1', '')}/tags`;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to fetch models (${response.status}): ${errText}`);
    }

    const data = await response.json();

    if (provider.type === 'openai' || provider.type === 'openrouter') {
      return data.data.map((m: any) => m.id).sort();
    } else if (provider.type === 'gemini') {
      return data.models.map((m: any) => m.name.replace('models/', '')).sort();
    } else if (provider.type === 'local') {
      return data.models.map((m: any) => m.name).sort();
    }

    return [];
  } catch (error) {
    console.error('Error fetching models:', error);
    throw error;
  }
}

export async function sendMessage(
  provider: AIProvider,
  messages: ChatMessage[],
  onStream: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const apiMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages.map((m) => ({
      role: m.role,
      content: m.content + (m.attachments?.length
        ? '\n\nAttachments:\n' + m.attachments.map(a => `[${a.type}: ${a.name}]\n\`\`\`${a.language || ''}\n${a.content}\n\`\`\``).join('\n')
        : ''),
    })),
  ];

  if (!provider.apiKey && provider.type !== 'local') {
    return simulateResponse(messages[messages.length - 1]?.content || '', onStream);
  }

  try {
    const url = provider.type === 'gemini'
      ? `${provider.baseUrl}/models/${provider.model}:streamGenerateContent?alt=sse&key=${provider.apiKey}`
      : `${provider.baseUrl}/chat/completions`;

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (provider.type !== 'gemini') {
      headers['Authorization'] = `Bearer ${provider.apiKey}`;
    }
    if (provider.type === 'openrouter') {
      headers['HTTP-Referer'] = 'https://devagent.ai';
      headers['X-Title'] = 'DevAgent AI';
    }

    let body: string;
    if (provider.type === 'gemini') {
      body = JSON.stringify({
        contents: apiMessages.filter(m => m.role !== 'system').map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      });
    } else {
      body = JSON.stringify({
        model: provider.model,
        messages: apiMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 4096,
      });
    }

    const response = await fetch(url, { method: 'POST', headers, body, signal });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API Error ${response.status}: ${errText}`);
    }

    if (!response.body) throw new Error('No response body');
    const reader = response.body.getReader();

    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          let chunk = '';

          if (provider.type === 'gemini') {
            chunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
          } else {
            chunk = parsed.choices?.[0]?.delta?.content || '';
          }

          if (chunk) {
            fullText += chunk;
            onStream(fullText);
          }
        } catch { /* skip parse errors */ }
      }
    }

    return fullText;
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err;
    console.error('AI API Error:', err);
    // On Android, network errors can sometimes be cryptic, so we provide a better message
    throw new Error(`AI Service Error: ${(err as Error).message}. Please check your internet connection and API keys.`);
  }
}

async function simulateResponse(userMsg: string, onStream: (chunk: string) => void): Promise<string> {
  const response = `## DevAgent AI (Demo Mode) 🤖\n\nYou asked: "${userMsg}"\n\nTo enable full AI features, please provide a valid API key in the settings. In demo mode, I can only provide simulated responses.`;

  // Simulate streaming
  const words = response.split(' ');
  let built = '';
  for (let i = 0; i < words.length; i++) {
    built += (i === 0 ? '' : ' ') + words[i];
    onStream(built);
    await new Promise((r) => setTimeout(r, 15));
  }

  return response;
}

export function getFileContent(path: string): string {
  return DEMO_FILES[path] || `// File: ${path}\n// Content not available in demo mode`;
}
