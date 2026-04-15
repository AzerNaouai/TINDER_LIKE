import { useState } from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { LoginPage } from '@/sections/LoginPage';
import { JobSeekerDashboard } from '@/sections/JobSeekerDashboard';
import { CompanyDashboard } from '@/sections/CompanyDashboard';
import { Button } from '@/components/ui/button';
import { Briefcase, Building2, User } from 'lucide-react';

function RoleSwitcher() {
  const { user, switchRole, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  if (!user) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="relative">
        <Button
          variant="outline"
          className="glass-effect border-white/20 gap-2"
          onClick={() => setShowMenu(!showMenu)}
        >
          <User className="w-4 h-4" />
          <span className="capitalize">{user.role.replace('_', ' ')}</span>
        </Button>
        
        {showMenu && (
          <div className="absolute right-0 mt-2 w-56 rounded-xl glass-effect border border-white/10 overflow-hidden animate-fade-in">
            <div className="p-2">
              <p className="text-xs text-muted-foreground px-3 py-2">Switch Role</p>
              <button
                onClick={() => { switchRole('jobseeker'); setShowMenu(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  user.role === 'jobseeker' ? 'bg-primary/20 text-primary' : 'hover:bg-white/5'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                Job Seeker
              </button>
              <button
                onClick={() => { switchRole('company_admin'); setShowMenu(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  user.role === 'company_admin' ? 'bg-primary/20 text-primary' : 'hover:bg-white/5'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Company Admin
              </button>
              <button
                onClick={() => { switchRole('recruiter'); setShowMenu(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  user.role === 'recruiter' ? 'bg-primary/20 text-primary' : 'hover:bg-white/5'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Recruiter
              </button>
            </div>
            <div className="border-t border-white/10 p-2">
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <>
      <RoleSwitcher />
      {user?.role === 'jobseeker' ? <JobSeekerDashboard /> : <CompanyDashboard />}
    </>
  );
}

import { useMockDataInternal, MockDataContext } from '@/hooks/useMockData';

function MockDataProvider({ children }: { children: React.ReactNode }) {
  const data = useMockDataInternal();
  return <MockDataContext.Provider value={data}>{children}</MockDataContext.Provider>;
}

function App() {
  return (
    <MockDataProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </MockDataProvider>
  );
}

export default App;
