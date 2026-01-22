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
  location?: string;
  needsProfileCompletion?: boolean;
  isAnonymous?: boolean;
  isPaid?: boolean;
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
  const { signIn, signOut: convexSignOut } = useAuthActions();
  const user = useQuery(api.users.viewer);
  const [location, setLocation] = useLocation();

  const signOut = async () => {
    await convexSignOut();
    setLocation('/');
  };

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    const needsPreAssessment = user?.needsProfileCompletion === true;

    // If the user still needs to complete the pre-assessment, always send them to matching preview.
    if (needsPreAssessment) {
      sessionStorage.removeItem('redirectAfterLogin');
      if (location !== '/matching-preview') {
        setLocation('/matching-preview');
      }
      return;
    }

    // If they land on matching-preview but have already completed it, move them to the dashboard.
    if (!needsPreAssessment && location === '/matching-preview') {
      setLocation('/dashboard');
      return;
    }

    // If there is a stored redirect (set before login), honor it once.
    const stored = sessionStorage.getItem('redirectAfterLogin');
    if (stored) {
      sessionStorage.removeItem('redirectAfterLogin');
      if (location !== stored) {
        setLocation(stored);
      }
    }
  }, [
    isAuthenticated,
    isLoading,
    location,
    setLocation,
    user?.needsProfileCompletion,
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
