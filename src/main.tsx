import { createRoot } from 'react-dom/client'
import { useEffect } from 'react'
import { AuthProvider } from './hooks/useAuth'
import { useTheme } from './hooks/useTheme'
import App from './App.tsx'
import './index.css'

// Set dark mode as default before React renders
const root = document.documentElement;
if (!localStorage.getItem('theme')) {
  root.classList.remove('light');
  root.classList.add('dark');
  localStorage.setItem('theme', 'dark');
} else {
  const savedTheme = localStorage.getItem('theme');
  root.classList.remove('light', 'dark');
  root.classList.add(savedTheme || 'dark');
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
