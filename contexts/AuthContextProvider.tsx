import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useConvexAuth, useQuery, useMutation } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import { api } from 'convex/_generated/api';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';

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
  signOut: () => Promise<void>;
  isSavingBeforeLogout: boolean;
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
  const [isSavingBeforeLogout, setIsSavingBeforeLogout] = useState(false);
  const [showSaveError, setShowSaveError] = useState(false);
  
  // Query for partial assessment
  const partialAssessment = useQuery(api.partialAssessments.getForUser);
  
  // Mutation to save partial assessment
  const savePartialAssessment = useMutation(api.partialAssessments.savePartialAssessment);
  
  // Retry wrapper with exponential backoff
  const savePartialAssessmentWithRetry = async (args: any, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Logout Save] Attempt ${attempt}/${maxRetries}`);
        const result = await savePartialAssessment(args);
        return result;
      } catch (error) {
        console.error(`[Logout Save] Attempt ${attempt} failed:`, error);
        if (attempt === maxRetries) {
          throw error;
        }
        const delay = Math.pow(2, attempt - 1) * 500; // 500ms, 1000ms
        console.log(`[Logout Save] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

  const signOut = async () => {
    const hasIncompleteAssessment = user?.needsProfileCompletion === true && partialAssessment?.answers;
    
    if (hasIncompleteAssessment) {
      setIsSavingBeforeLogout(true);
      const startTime = performance.now();
      
      try {
        console.log('[Logout Save] Starting save attempt...');
        const saveStartTime = performance.now();
        
        // Race between save with retries and timeout
        await Promise.race([
          savePartialAssessmentWithRetry({
            answers: partialAssessment.answers || {},
            currentIndex: partialAssessment.currentIndex || 0,
            currentStage: partialAssessment.currentStage || 'questions',
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Save timeout after 5 seconds')), 5000)
          )
        ]);
        
        const saveEndTime = performance.now();
        const saveDuration = saveEndTime - saveStartTime;
        console.log(`[Logout Save] Save completed successfully in ${saveDuration.toFixed(0)}ms`);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        const totalTime = performance.now() - startTime;
        console.log(`[Logout Save] Total logout save process: ${totalTime.toFixed(0)}ms`);
        
      } catch (error) {
        const failedTime = performance.now() - startTime;
        console.error(`[Logout Save] All retries failed after ${failedTime.toFixed(0)}ms:`, error);
        
        setShowSaveError(true);
        await new Promise(resolve => setTimeout(resolve, 3000));
        setShowSaveError(false);
      } finally {
        setIsSavingBeforeLogout(false);
      }
    }
    
    await convexSignOut();
    setLocation('/');
  };

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    const needsPreAssessment = user?.needsProfileCompletion === true;

    // If the user still needs to complete the pre-assessment, always send them to matching preview.
    // But allow them to stay on the home page ("/"), auth pages, upgrade/pricing pages
    if (needsPreAssessment) {
      sessionStorage.removeItem('redirectAfterLogin');
      if (location !== '/matching-preview' && location !== '/' && !location.startsWith('/auth') && location !== '/upgrade' && location !== '/pricing') {
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
    isSavingBeforeLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      
      {/* Saving modal during logout */}
      {isSavingBeforeLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md mx-4 text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Saving Your Progress
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we save your assessment progress...
            </p>
          </div>
        </div>
      )}
      
      {/* Error modal if save fails */}
      {showSaveError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md mx-4 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Unable to Save Progress
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              We couldn't save your latest progress, but your previous answers are still preserved.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Logging you out now...
            </p>
          </div>
        </div>
      )}
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
