"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import { WizardContext } from '@/lib/wizard-context';

interface WizardContextProviderProps {
  children: ReactNode;
}

const WizardContextContext = createContext<{
  context: WizardContext | undefined;
  setContext: (context: WizardContext | undefined) => void;
} | undefined>(undefined);

export function WizardContextProvider({ children }: WizardContextProviderProps) {
  const [context, setContext] = useState<WizardContext | undefined>(undefined);

  return (
    <WizardContextContext.Provider value={{ context, setContext }}>
      {children}
    </WizardContextContext.Provider>
  );
}

export function useWizardContext() {
  const ctx = useContext(WizardContextContext);
  if (!ctx) {
    throw new Error('useWizardContext must be used within WizardContextProvider');
  }
  return ctx;
}
