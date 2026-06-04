import type { AIProvider, ChatMessage, AgentMode } from '../types';
import { DEMO_FILES } from '../utils/demoData';

const SYSTEM_PROMPT = `You are DevAgent AI, an expert coding assistant that works with local project files on Android devices.

You have access to the following tools:
- read_file(path, start_line?, end_line?) — Read file contents
- write_file(path, content) — Write content to existing file
- create_file(path, content) — Create a new file
- delete_file(path) — Delete a file
- rename_file(old_path, new_path) — Rename/move a file
- search_files(pattern) — Search files by name pattern (glob or regex)
- search_code(query, file_pattern?) — Search code content
- create_folder(path) — Create a folder
- get_project_tree(max_depth?) — Get project directory tree
- run_command(command, cwd?) — Run a terminal command (whitelisted: npm, bun, pip, git, python, npx)

When you need to modify files, always explain your changes first, then use the appropriate tool.
Format tool calls as JSON blocks with the tool name and arguments.

Always provide clear explanations and use markdown formatting in your responses.`;

export async function sendMessage(
  provider: AIProvider,
  messages: ChatMessage[],
  _mode: AgentMode,
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

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

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
    return simulateResponse(messages[messages.length - 1]?.content || '', onStream);
  }
}

async function simulateResponse(userMsg: string, onStream: (chunk: string) => void): Promise<string> {
  const lower = userMsg.toLowerCase();

  let response = '';

  if (lower.includes('eslint') || lower.includes('lint')) {
    response = `## Adding ESLint with Airbnb Configuration 🔧

I'll set up ESLint with the Airbnb configuration for your project. Here's what I'll do:

### Step 1: Create ESLint configuration

I'll create a \`.eslintrc.json\` file:

\`\`\`tool
{
  "tool": "create_file",
  "path": ".eslintrc.json",
  "content": {
    "extends": ["airbnb", "airbnb-typescript", "airbnb/hooks"],
    "parserOptions": {
      "project": "./tsconfig.json"
    },
    "rules": {
      "react/react-in-jsx-scope": "off",
      "import/prefer-default-export": "off"
    }
  }
}
\`\`\`

### Step 2: Update package.json

Adding the lint script and dev dependencies:

\`\`\`tool
{
  "tool": "write_file",
  "path": "package.json",
  "changes": "Add lint script and ESLint dependencies"
}
\`\`\`

### Step 3: Install dependencies

\`\`\`bash
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-config-airbnb eslint-config-airbnb-typescript eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react eslint-plugin-react-hooks
\`\`\`

Would you like me to apply these changes?`;
  } else if (lower.includes('error') || lower.includes('stack') || lower.includes('bug') || lower.includes('fix')) {
    response = `## Error Analysis 🔍

Let me analyze this error and find the root cause.

### Analysis

I'll first read the relevant files to understand the context:

\`\`\`tool
{
  "tool": "read_file",
  "path": "src/App.tsx"
}
\`\`\`

### Root Cause

Based on the error, the issue is likely in the component rendering logic. Here are my findings:

1. **Missing null check** — The component doesn't handle the case when data is \`undefined\`
2. **Type mismatch** — The prop type doesn't match the expected interface

### Suggested Fix

\`\`\`typescript
// Before
const data = useData();
return <Display items={data.items} />;

// After
const data = useData();
if (!data) return <Loading />;
return <Display items={data.items ?? []} />;
\`\`\`

Would you like me to apply this fix?`;
  } else if (lower.includes('help') || lower.includes('what can')) {
    response = `## DevAgent AI — What I Can Do 🤖

I'm your AI coding assistant with full project access. Here's what I can help with:

### 📁 File Operations
- **Read, create, edit, delete** files in your project
- **Rename and move** files between directories
- **Search** by filename or code content

### 🔧 Code Assistance
- **Write new features** across multiple files
- **Refactor** existing code
- **Fix bugs** from error logs and stack traces
- **Add configurations** (ESLint, Prettier, TypeScript, etc.)

### 🏗️ Project Management
- **Understand project structure** automatically
- **Run commands** (npm, git, python, etc.)
- **Generate boilerplate** for components, hooks, utilities

### 🐛 Debugging
- Paste a **stack trace** and I'll find the source
- Paste **error logs** for automatic analysis
- I can suggest and apply fixes directly

### 💡 Agent Modes
| Mode | Description |
|------|-------------|
| **Ask** | I only answer questions, no file changes |
| **Edit** | I can modify files with your approval |
| **Agent** | I autonomously plan and execute multi-step tasks |

---

Try asking me something like:
- *"Add a dark mode toggle to the app"*
- *"Refactor the auth hook to use React Query"*
- *"Create a new API service module"*`;
  } else if (lower.includes('component') || lower.includes('create') || lower.includes('add')) {
    response = `## Creating New Component 🧩

I'll create the component for you. Let me plan the implementation:

### Files to create/modify:

1. **New component file**
2. **Update imports** in parent component
3. **Add styles** if needed

### Implementation

\`\`\`tsx
// src/components/NewComponent.tsx
import React, { useState } from 'react';

interface Props {
  title: string;
  onAction?: () => void;
}

export function NewComponent({ title, onAction }: Props) {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="rounded-lg border p-4 transition-all hover:shadow-md">
      <h3 className="text-lg font-semibold">{title}</h3>
      <button
        onClick={() => {
          setIsActive(!isActive);
          onAction?.();
        }}
        className={cn(
          "mt-2 px-4 py-2 rounded-md transition-colors",
          isActive ? "bg-blue-600 text-white" : "bg-gray-100"
        )}
      >
        {isActive ? 'Active' : 'Activate'}
      </button>
    </div>
  );
}
\`\`\`

\`\`\`tool
{
  "tool": "create_file",
  "path": "src/components/NewComponent.tsx",
  "content": "... (as shown above)"
}
\`\`\`

Shall I apply this change?`;
  } else if (lower.includes('tree') || lower.includes('structure') || lower.includes('project')) {
    response = `## Project Structure 📁

\`\`\`
my-app/
├── src/
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Entry point
│   ├── index.css            # Global styles
│   ├── components/
│   │   ├── Header.tsx       # Header component
│   │   └── Button.tsx       # Reusable button
│   └── hooks/
│       └── useAuth.ts       # Authentication hook
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .gitignore
└── README.md
\`\`\`

### Summary
- **Framework:** React + TypeScript
- **Bundler:** Vite
- **Components:** 2 (Header, Button)
- **Hooks:** 1 (useAuth)
- **Total files:** 10

The project follows a standard React + Vite structure with TypeScript.`;
  } else {
    response = `## Let me help you with that! 🚀

I've analyzed your request. Here's my approach:

### Understanding
${userMsg}

### Plan
1. **Analyze** the current project structure
2. **Identify** relevant files to modify
3. **Implement** the changes with proper TypeScript types
4. **Test** the implementation

### Next Steps

I'll need to read some files first to understand the context:

\`\`\`tool
{
  "tool": "get_project_tree",
  "max_depth": 3
}
\`\`\`

\`\`\`tool
{
  "tool": "read_file",
  "path": "src/App.tsx"
}
\`\`\`

Based on the project structure, I can see this is a **React + TypeScript** project using **Vite**.

Would you like me to proceed with the implementation? I can:
- Create new files
- Modify existing code
- Run terminal commands
- Set up configurations

Just let me know the details!`;
  }

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
