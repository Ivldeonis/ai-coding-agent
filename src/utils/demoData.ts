export const DEMO_FILES: Record<string, string> = {
  'src/App.tsx': `import React from 'react';
import { Header } from './components/Header';
import { Button } from './components/Button';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="My App" />
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold">Welcome</h1>
        <p className="mt-2 text-gray-600">
          This is a demo React application.
        </p>
        <Button onClick={() => alert('Clicked!')}>
          Click me
        </Button>
      </main>
    </div>
  );
}`,
  'src/main.tsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(
  document.getElementById('root')!
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
  'src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}`,
  'src/components/Header.tsx': `import React from 'react';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-3">
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>
    </header>
  );
}`,
  'src/components/Button.tsx': `import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  const base = 'px-4 py-2 rounded-lg font-medium transition-colors';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  };

  return (
    <button className={\`\${base} \${variants[variant]}\`} onClick={onClick}>
      {children}
    </button>
  );
}`,
  'src/hooks/useAuth.ts': `import { useState, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      // API call here
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return { user, loading, login, logout };
}`,
  'package.json': `{
  "name": "my-app",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}`,
  'tsconfig.json': `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true
  },
  "include": ["src"]
}`,
  'vite.config.ts': `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});`,
  '.gitignore': `node_modules
dist
.env
.env.local
*.log`,
  'README.md': `# My App

A React + TypeScript application built with Vite.

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Scripts

- \`npm run dev\` — Start development server
- \`npm run build\` — Build for production
- \`npm run preview\` — Preview production build
`,
};
