import { createRoot } from 'react-dom/client'
import { useEffect } from 'react'
import { AuthProvider } from './hooks/useAuth'
import { useTheme } from './hooks/useTheme'
import App from './App.tsx'
import './index.css'

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
