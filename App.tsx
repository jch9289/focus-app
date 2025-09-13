import React, { useState, useEffect } from 'react';
import { SessionConfig, FocusLog } from './types';
import SessionSetup from './components/SessionSetup';
import ActiveSession from './components/ActiveSession';
import Dashboard from './components/Dashboard';
import { ICONS } from './constants';

type AppState = 'setup' | 'active' | 'dashboard';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('setup');
  const [sessionConfig, setSessionConfig] = useState<SessionConfig | null>(null);
  const [focusLogs, setFocusLogs] = useState<FocusLog[]>(() => {
    const savedLogs = localStorage.getItem('focusLogs');
    return savedLogs ? JSON.parse(savedLogs) : [];
  });

  useEffect(() => {
    localStorage.setItem('focusLogs', JSON.stringify(focusLogs));
  }, [focusLogs]);

  const handleStartSession = (config: SessionConfig) => {
    setSessionConfig(config);
    setAppState('active');
  };

  const handleSessionEnd = (sessionLogs: FocusLog[]) => {
    setFocusLogs(prevLogs => [...prevLogs, ...sessionLogs]);
    setSessionConfig(null);
    setAppState('dashboard');
  };

  const renderContent = () => {
    switch (appState) {
      case 'active':
        return sessionConfig && <ActiveSession config={sessionConfig} onSessionEnd={handleSessionEnd} />;
      case 'dashboard':
        return <Dashboard logs={focusLogs} />;
      case 'setup':
      default:
        return <SessionSetup onStartSession={handleStartSession} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto max-w-5xl p-4 sm:p-8 pb-24">
        <header className="flex items-center space-x-3 mb-8">
           <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center">
              {ICONS.BRAIN}
           </div>
           <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">집중력 도우미</h1>
        </header>

        <main>
          {renderContent()}
        </main>
      </div>

      {appState !== 'active' && (
        <footer className="fixed bottom-0 left-0 right-0 bg-slate-800/80 backdrop-blur-sm border-t border-slate-700 z-10">
          <nav className="max-w-5xl mx-auto flex justify-around p-1">
            <button onClick={() => setAppState('setup')} className={`flex flex-col items-center justify-center space-y-1 p-2 rounded-lg transition-colors w-28 h-14 ${appState === 'setup' ? 'text-cyan-400 bg-slate-700/50' : 'text-slate-400 hover:text-white'}`}>
              {ICONS.SETTINGS}
              <span className="text-xs font-medium">새 세션</span>
            </button>
            <button onClick={() => setAppState('dashboard')} className={`flex flex-col items-center justify-center space-y-1 p-2 rounded-lg transition-colors w-28 h-14 ${appState === 'dashboard' ? 'text-cyan-400 bg-slate-700/50' : 'text-slate-400 hover:text-white'}`}>
              {ICONS.CHART}
              <span className="text-xs font-medium">대시보드</span>
            </button>
          </nav>
        </footer>
      )}
    </div>
  );
};

export default App;