import { NavLink, Outlet } from 'react-router-dom';
import AccountMenu from './AccountMenu';

const tabs = [
  { to: '/', label: 'Home' },
  { to: '/roles', label: 'Roles' },
  { to: '/trackr', label: 'Tracker' },
  { to: '/firms', label: 'Firms' },
  { to: '/questions', label: 'Questions' },
  { to: '/mock', label: 'Mock' },
  { to: '/options', label: 'Options' },
  { to: '/games', label: 'Games' },
  { to: '/resources', label: 'Resources' },
];

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-steel bg-panel/80 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto max-w-6xl px-4 flex items-center gap-4 h-14">
          <NavLink to="/" className="wordmark font-mono font-bold text-lg tracking-tight shrink-0">
            QUANT//INTERVIEW
          </NavLink>
          <nav aria-label="Main" className="overflow-x-auto -mb-px">
            <ul className="flex items-center gap-1 font-mono text-xs uppercase tracking-wider">
              {tabs.map((t) => (
                <li key={t.to}>
                  <NavLink
                    to={t.to}
                    end={t.to === '/'}
                    className={({ isActive }) =>
                      `block px-3 py-4 border-b-2 whitespace-nowrap transition-colors ${
                        isActive
                          ? 'border-violet text-violet-light'
                          : 'border-transparent text-muted hover:text-fg'
                      }`
                    }
                  >
                    {t.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <AccountMenu />
        </div>
      </header>

      <main className="flex-1 w-full mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-steel mt-12">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted space-y-2">
          <p className="font-mono uppercase tracking-wider text-fg/70">Quant Interview</p>
          <p>
            Free and independent. Not affiliated with any firm listed. Opening windows and
            compensation figures are approximate and change every year — always verify on the
            firm&apos;s own careers page. Your tracker data, scores, and progress are stored only in
            this browser.
          </p>
        </div>
      </footer>
    </div>
  );
}
