import { createRoot } from 'react-dom/client'
import { useEffect } from 'react'
import { AuthProvider } from './hooks/useAuth'
import { useTheme } from './hooks/useTheme'
import App from './App.tsx'
import './index.css'

// Set theme based on system preference before React renders
const root = document.documentElement;
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light' || savedTheme === 'dark') {
  root.classList.remove('light', 'dark');
  root.classList.add(savedTheme);
} else {
  // Detect system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const systemTheme = prefersDark ? 'dark' : 'light';
  root.classList.remove('light', 'dark');
  root.classList.add(systemTheme);
  localStorage.setItem('theme', systemTheme);
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return <>{children}</>;
}

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </AuthProvider>
);
