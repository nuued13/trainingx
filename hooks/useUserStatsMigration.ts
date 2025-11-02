import { useEffect, useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from 'convex/_generated/api';
import { useAuth } from '@/contexts/AuthContextProvider';
import { migrateLocalStorageToConvex } from '@/lib/migrate-to-convex';

export function useUserStatsMigration() {
  const { user } = useAuth();
  const [migrationStatus, setMigrationStatus] = useState<{
    completed: boolean;
    message?: string;
  }>({ completed: false });

  const initializeUserStats = useMutation(api.users.initializeUserStats);
  const updateAssessmentResults = useMutation(api.users.updateAssessmentResults);
  const completeProject = useMutation(api.users.completeProject);
  const updateSkills = useMutation(api.users.updateSkills);

  useEffect(() => {
    if (user?._id && !migrationStatus.completed) {
      const runMigration = async () => {
        try {
          const result = await migrateLocalStorageToConvex(
            user._id as any,
            initializeUserStats,
            updateAssessmentResults,
            completeProject,
            updateSkills
          );
          
          setMigrationStatus({
            completed: true,
            message: result.message,
          });

          if (result.migrated) {
            console.log('✅ Migration successful:', result.message);
          }
        } catch (error) {
          console.error('Migration error:', error);
          setMigrationStatus({
            completed: true,
            message: 'Migration failed',
          });
        }
      };

      runMigration();
    }
  }, [user?._id, migrationStatus.completed]);

  return migrationStatus;
}
