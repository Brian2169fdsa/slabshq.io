'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layers, Plus, LogOut } from 'lucide-react';
import { NAV } from './nav';
import { useShell } from './ShellContext';

export function Sidebar() {
  const pathname = usePathname();
  const { role, storefrontOn } = useShell();

  return (
    <aside className="sidebar" id="sidebar">
      {NAV.map((section, si) => {
        if (!section.roles.includes(role)) return null;
        if (section.store && !storefrontOn) return null;
        const items = section.items.filter((it) => it.roles.includes(role));
        if (items.length === 0) return null;

        return (
          <div className="nav-section" key={si}>
            {section.divider && <div className="nav-div" />}
            {section.label && <div className="nav-label">{section.label}</div>}
            <div className="nav-group">
              {items.map((it) => {
                const Icon = it.icon;
                const isActive = it.active
                  ? pathname === '/dashboard'
                  : pathname === it.href;
                return (
                  <Link
                    key={it.href + it.label}
                    href={it.href}
                    className={`nav-item${isActive ? ' active' : ''}`}
                    title={it.phase2 ? 'Phase 2 — UI shell' : undefined}
                  >
                    <Icon size={18} />
                    <span>{it.label}</span>
                    {it.tag && <span className="tag">{it.tag}</span>}
                  </Link>
                );
              })}
              {section.label === 'Categories' && (
                <button className="add-cat" type="button">
                  <Plus size={16} />
                  <span>Add Category</span>
                </button>
              )}
            </div>
          </div>
        );
      })}
      <div className="sidebar-foot nav-group">
        <Link href="/" className="nav-item">
          <LogOut size={18} />
          <span>Sign Out</span>
        </Link>
      </div>
    </aside>
  );
}

export function LogoRail() {
  return (
    <div className="logo-rail">
      <Link className="logo" href="/dashboard">
        <span className="slab-frame">
          <Layers size={15} />
        </span>
        <span className="logo-text">
          <span className="b">slab</span>
          <span className="h">HQ</span>
          <span className="d">.ai</span>
        </span>
      </Link>
    </div>
  );
}
