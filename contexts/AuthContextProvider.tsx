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
    if (!(user as any)?.needsProfileCompletion) return;
    if (location === '/signup') return;

    const shouldStoreRedirect = location !== '/signup';
    const hasStored = !!sessionStorage.getItem('redirectAfterLogin');

    // If coming directly from /auth and the user needs to complete profile,
    // default the post-profile destination to dashboard.
    if (!hasStored && location === '/auth') {
      sessionStorage.setItem('redirectAfterLogin', '/dashboard');
    } else if (shouldStoreRedirect && !hasStored && location !== '/auth') {
      sessionStorage.setItem('redirectAfterLogin', location);
    }
    setLocation('/signup');
  }, [
    isAuthenticated,
    isLoading,
    location,
    setLocation,
    (user as any)?.needsProfileCompletion,
  ]);

  // Gate: require pre-assessment before accessing the platform
  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    // If profile needs completion, let the other effect handle it first
    if ((user as any)?.needsProfileCompletion) return;

    const preDone = (user as any)?.preAssessmentCompleted === true;
    if (preDone) return;

    // Allow access to root, auth, signup, and matching-preview without redirect
    const isAllowedRoute =
      location === '/' ||
      location === '/auth' ||
      location === '/signup' ||
      location === '/matching-preview';
    if (isAllowedRoute) return;

    // Store intended destination once if not already set
    if (!sessionStorage.getItem('redirectAfterLogin')) {
      sessionStorage.setItem('redirectAfterLogin', location);
    }

    setLocation('/matching-preview');
  }, [
    isAuthenticated,
    isLoading,
    location,
    setLocation,
    (user as any)?.preAssessmentCompleted,
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
