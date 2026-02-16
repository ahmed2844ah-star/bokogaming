
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AppSection, User, Transaction, AdminSettings, GameConfig, ReferredUser } from './types';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// تحميل الصفحات بشكل كسول
const Home = lazy(() => import('./pages/Home'));
const Aviator = lazy(() => import('./pages/Aviator'));
const Crash = lazy(() => import('./pages/Crash'));
const Roulette = lazy(() => import('./pages/Roulette'));
const Poker = lazy(() => import('./pages/Poker'));
const Mines = lazy(() => import('./pages/Mines'));
const Dice = lazy(() => import('./pages/Dice'));
const Plinko = lazy(() => import('./pages/Plinko'));
const Slots = lazy(() => import('./pages/Slots'));
const Blackjack = lazy(() => import('./pages/Blackjack'));
const Limbo = lazy(() => import('./pages/Limbo'));
const CryptoTrading = lazy(() => import('./pages/CryptoTrading'));
const Wallet = lazy(() => import('./pages/Wallet'));
const Profile = lazy(() => import('./pages/Profile'));
const Admin = lazy(() => import('./pages/Admin'));
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Referral = lazy(() => import('./pages/Referral'));

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px] animate-fadeIn">
    <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
    <p className="text-slate-500 font-black uppercase tracking-widest text-xs text-center">جاري فتح الأبواب الملكية...</p>
  </div>
);

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AppSection>(AppSection.HOME);
  const [authView, setAuthView] = useState<'landing' | 'login' | 'register' | 'admin_login'>('landing');
  const [user, setUser] = useState<User | null>(null);
  
  // تحميل المستخدمين من التخزين المحلي
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('boko_users');
    return saved ? JSON.parse(saved) : [];
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(localStorage.getItem('theme') as 'dark' | 'light' || 'dark');
  
  // حفظ المستخدمين عند أي تغيير
  useEffect(() => {
    localStorage.setItem('boko_users', JSON.stringify(allUsers));
  }, [allUsers]);

  const initialGameSettings: Record<string, GameConfig> = {
    [AppSection.AVIATOR]: { enabled: true, houseEdge: 1.5, minBet: 10, maxBet: 10000 },
    [AppSection.CRASH]: { enabled: true, houseEdge: 1.5, minBet: 10, maxBet: 10000 },
    [AppSection.ROULETTE]: { enabled: true, houseEdge: 2.7, minBet: 10, maxBet: 5000 },
    [AppSection.MINES]: { enabled: true, houseEdge: 2.0, minBet: 10, maxBet: 5000 },
    [AppSection.SLOTS]: { enabled: true, houseEdge: 5.0, minBet: 10, maxBet: 2000 },
    [AppSection.POKER]: { enabled: true, houseEdge: 1.0, minBet: 50, maxBet: 50000 },
    [AppSection.BLACKJACK]: { enabled: true, houseEdge: 0.5, minBet: 10, maxBet: 10000 },
    [AppSection.DICE]: { enabled: true, houseEdge: 1.0, minBet: 10, maxBet: 10000 },
    [AppSection.PLINKO]: { enabled: true, houseEdge: 2.0, minBet: 10, maxBet: 5000 },
    [AppSection.LIMBO]: { enabled: true, houseEdge: 1.0, minBet: 10, maxBet: 10000 },
    [AppSection.CRYPTO]: { enabled: true, houseEdge: 0.1, minBet: 10, maxBet: 100000 },
  };

  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    depositMethods: [
      { id: '1', name: 'فودافون كاش', icon: '📞', value: '01012345678', enabled: true, color: 'bg-red-600' },
      { id: '2', name: 'إنستا باي', icon: '⚡', value: 'boko@instapay', enabled: true, color: 'bg-purple-600' },
      { id: '3', name: 'USDT (TRC20)', icon: '₮', value: 'T8xJp...3kL9', enabled: true, color: 'bg-teal-600' }
    ],
    minDeposit: 50,
    minWithdrawal: 100,
    withdrawalFee: 5,
    gameSettings: initialGameSettings
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const updateBalance = (amount: number) => {
    if (!user) return;
    setUser(prev => {
      if (!prev) return null;
      let newRealBalance = prev.balance;
      let newBonusBalance = prev.bonusBalance;
      if (amount < 0) {
        const absAmount = Math.abs(amount);
        if (newBonusBalance >= absAmount) newBonusBalance -= absAmount;
        else {
          const remaining = absAmount - newBonusBalance;
          newBonusBalance = 0;
          newRealBalance -= remaining;
        }
      } else newRealBalance += amount;
      
      const updatedUser = { ...prev, balance: newRealBalance, bonusBalance: newBonusBalance };
      // تحديث في القائمة الكلية أيضاً
      setAllUsers(users => users.map(u => u.id === prev.id ? updatedUser : u));
      return updatedUser;
    });
  };

  const handleAuthSuccess = (u: User) => {
    setUser(u);
    setAuthView('landing');
    // إضافة المستخدم للقائمة إذا لم يكن موجوداً (للتسجيل الجديد)
    setAllUsers(prev => {
      const exists = prev.find(item => item.id === u.id);
      if (exists) return prev;
      return [...prev, u];
    });
  };

  const renderSection = () => {
    if (authView === 'admin_login' || isAdminAuthenticated) {
       return (
        <Suspense fallback={<LoadingSpinner />}>
          <Admin 
            isAuthenticated={isAdminAuthenticated} 
            onAuthenticate={() => setIsAdminAuthenticated(true)}
            settings={adminSettings}
            onUpdateSettings={setAdminSettings}
            onExit={() => { setIsAdminAuthenticated(false); setAuthView('landing'); }}
            transactions={transactions}
            onUpdateTransaction={(id, status) => {
              setTransactions(prev => prev.map(t => t.id === id ? { ...t, status } : t));
            }}
            users={allUsers}
            onUpdateUser={(updatedUser) => {
              if (user && user.id === updatedUser.id) setUser(updatedUser);
              setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
            }}
          />
        </Suspense>
      );
    }

    if (!user) {
      return (
        <Suspense fallback={<LoadingSpinner />}>
          {authView === 'login' ? <Login users={allUsers} onBack={() => setAuthView('landing')} onLogin={handleAuthSuccess} /> :
           authView === 'register' ? <Register onBack={() => setAuthView('landing')} onRegister={handleAuthSuccess} /> :
           <Landing onLogin={() => setAuthView('login')} onRegister={() => setAuthView('register')} onNavigateAdmin={() => setAuthView('admin_login')} />}
        </Suspense>
      );
    }

    return (
      <Suspense fallback={<LoadingSpinner />}>
        {activeSection === AppSection.HOME && <Home onNavigate={setActiveSection} onNavigateAdmin={() => setAuthView('admin_login')} />}
        {activeSection === AppSection.AVIATOR && <Aviator user={user} onUpdateBalance={updateBalance} />}
        {activeSection === AppSection.CRASH && <Crash user={user} onUpdateBalance={updateBalance} />}
        {activeSection === AppSection.ROULETTE && <Roulette user={user} onUpdateBalance={updateBalance} />}
        {activeSection === AppSection.POKER && <Poker user={user} onUpdateBalance={updateBalance} />}
        {activeSection === AppSection.MINES && <Mines user={user} onUpdateBalance={updateBalance} />}
        {activeSection === AppSection.DICE && <Dice user={user} onUpdateBalance={updateBalance} />}
        {activeSection === AppSection.PLINKO && <Plinko user={user} onUpdateBalance={updateBalance} />}
        {activeSection === AppSection.SLOTS && <Slots user={user} onUpdateBalance={updateBalance} />}
        {activeSection === AppSection.BLACKJACK && <Blackjack user={user} onUpdateBalance={updateBalance} />}
        {activeSection === AppSection.LIMBO && <Limbo user={user} onUpdateBalance={updateBalance} />}
        {activeSection === AppSection.CRYPTO && <CryptoTrading user={user} onUpdateBalance={updateBalance} />}
        {activeSection === AppSection.WALLET && <Wallet user={user} transactions={transactions} onAddTransaction={(t) => setTransactions(prev => [t, ...prev])} onUpdateBalance={updateBalance} adminSettings={adminSettings} />}
        {activeSection === AppSection.PROFILE && <Profile user={user} transactions={transactions} />}
        {activeSection === AppSection.REFERRAL && <Referral user={user} />}
      </Suspense>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-['Cairo'] transition-colors duration-300">
      {!isAdminAuthenticated && authView !== 'admin_login' && user && (
        <Navbar user={user} onNavigate={setActiveSection} onLogout={() => { setUser(null); setAuthView('landing'); }} theme={theme} onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')} />
      )}
      <div className="flex flex-1 overflow-hidden">
        {!isAdminAuthenticated && authView !== 'admin_login' && user && (
          <Sidebar activeSection={activeSection} onNavigate={setActiveSection} />
        )}
        <main className={`flex-1 overflow-y-auto ${isAdminAuthenticated || authView === 'admin_login' ? '' : (user ? 'p-4 md:p-8' : '')}`}>
          <div className={`${isAdminAuthenticated || authView === 'admin_login' ? '' : (user ? 'max-w-7xl mx-auto' : 'h-full')}`}>
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
