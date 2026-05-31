'use client';

import { Search, Bell, LifeBuoy, KeyRound, UserRound, UsersRound } from 'lucide-react';
import { useShell } from './ShellContext';
import type { Role } from './nav';

const ROLES: { key: Role; label: string; icon: typeof KeyRound }[] = [
  { key: 'admin', label: 'Admin', icon: KeyRound },
  { key: 'owner', label: 'Owner', icon: UserRound },
  { key: 'team', label: 'Team', icon: UsersRound },
];

export function TopBar() {
  const { role, setRole } = useShell();
  return (
    <header className="topbar">
      <div className="search">
        <Search size={17} />
        <input placeholder="Search cards, sets, players..." />
        <kbd>⌘K</kbd>
      </div>
      <div className="top-right">
        <div className="role-switch" id="roleSwitch">
          <span className="rl">View as</span>
          {ROLES.map((r) => {
            const Icon = r.icon;
            return (
              <button
                key={r.key}
                className={role === r.key ? 'on' : ''}
                onClick={() => setRole(r.key)}
                type="button"
              >
                <Icon size={14} />
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>
        <button className="icon-btn" type="button">
          <Bell size={18} />
          <span className="dot" />
        </button>
        <button className="icon-btn" type="button">
          <LifeBuoy size={18} />
        </button>
        <div className="avatar">BR</div>
      </div>
    </header>
  );
}
