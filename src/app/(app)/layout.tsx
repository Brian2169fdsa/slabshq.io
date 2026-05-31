import { ShellProvider } from '@/components/shell/ShellContext';
import { Sidebar, LogoRail } from '@/components/shell/Sidebar';
import { TopBar } from '@/components/shell/TopBar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ShellProvider>
      <div className="app" id="app">
        <LogoRail />
        <TopBar />
        <Sidebar />
        <main className="main" id="main">
          {children}
        </main>
      </div>
    </ShellProvider>
  );
}
