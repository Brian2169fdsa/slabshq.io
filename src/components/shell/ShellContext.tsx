'use client';

import { createContext, useContext, useState } from 'react';
import type { Role } from './nav';

interface ShellState {
  role: Role;
  setRole: (r: Role) => void;
  storefrontOn: boolean;
  setStorefrontOn: (v: boolean) => void;
}

const ShellContext = createContext<ShellState | null>(null);

export function ShellProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('admin');
  const [storefrontOn, setStorefrontOn] = useState(true);
  return (
    <ShellContext.Provider value={{ role, setRole, storefrontOn, setStorefrontOn }}>
      {children}
    </ShellContext.Provider>
  );
}

export function useShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error('useShell must be used within ShellProvider');
  return ctx;
}
