import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface AdminStatus {
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
}

export const useAdminStatus = (): AdminStatus => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (authLoading) return; // Wait for auth to finish
      
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const { data, error: adminError } = await supabase
          .from('admins')
          .select('*')
          .eq('id', user.id)
          .single();

        if (adminError) {
          // Check if it's a table doesn't exist error (406) or other error
          if (adminError.code === 'PGRST116' || adminError.message?.includes('relation "admins" does not exist')) {
            console.log('Admins table does not exist, user is not an admin');
            setIsAdmin(false);
          } else {
            console.log('User is not an admin:', adminError.message);
            setIsAdmin(false);
          }
        } else if (data) {
          // User is an admin
          console.log('User is an admin');
          setIsAdmin(true);
        } else {
          // No admin record found
          console.log('No admin record found for user');
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
        setError('Failed to check admin status');
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, authLoading]);

  return { isAdmin, loading, error };
}; 