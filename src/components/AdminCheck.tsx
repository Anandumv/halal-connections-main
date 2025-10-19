import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface AdminCheckProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AdminCheck = ({ children, fallback }: AdminCheckProps) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        console.log('AdminCheck: Checking admin status for user:', user.id);
        
        const { data, error } = await supabase
          .from('admins')
          .select('*')
          .eq('id', user.id)
          .single();
        
        console.log('AdminCheck: Result:', { data, error });
        
        setIsAdmin(!error && !!data);
      } catch (error) {
        console.error('AdminCheck: Error:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-400"></div>
        <span className="ml-2 text-sm text-muted-foreground">Checking admin status...</span>
      </div>
    );
  }

  if (isAdmin) {
    return <>{children}</>;
  }

  return fallback ? <>{fallback}</> : null;
}; 