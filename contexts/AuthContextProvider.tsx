import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useConvexAuth, useQuery } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import { api } from 'convex/_generated/api';
import { useLocation } from 'wouter';

interface User {
  _id: string;
  email?: string;
  name?: string;
  image?: string;
  age?: number;
  gender?: string;
  needsProfileCompletion?: boolean;
  isAnonymous?: boolean;
}

interface AuthContext {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: ReturnType<typeof useAuthActions>['signIn'];
  signOut: ReturnType<typeof useAuthActions>['signOut'];
}

const AuthContext = createContext<AuthContext | undefined>(undefined);

interface AuthContextProviderProps {
  children: ReactNode;
}

export function AuthContextProvider({ children }: AuthContextProviderProps) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();
  const user = useQuery(api.users.viewer);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    if (!(user as any)?.needsProfileCompletion) return;
    if (location === '/complete-profile') return;

    const shouldStoreRedirect =
      location !== '/auth' && location !== '/complete-profile';
    if (shouldStoreRedirect && !sessionStorage.getItem('redirectAfterLogin')) {
      sessionStorage.setItem('redirectAfterLogin', location);
    }
    setLocation('/complete-profile');
  }, [
    isAuthenticated,
    isLoading,
    location,
    setLocation,
    (user as any)?.needsProfileCompletion,
  ]);

  const value: AuthContext = {
    user: user || null,
    isLoading,
    isAuthenticated,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
}
