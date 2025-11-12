import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role: 'admin' | 'teacher' | 'student';
}

export const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [hasRole, setHasRole] = useState<boolean | null>(null);

  useEffect(() => {
    const checkRole = async () => {
      if (!user) {
        navigate('/auth/signin');
        return;
      }

      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: role,
      });

      if (error) {
        console.error('Error checking role:', error);
        setHasRole(false);
        return;
      }

      setHasRole(data);
      if (!data) {
        navigate('/dashboard');
      }
    };

    if (!loading) {
      checkRole();
    }
  }, [user, loading, role, navigate]);

  if (loading || hasRole === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasRole) {
    return null;
  }

  return <>{children}</>;
};
