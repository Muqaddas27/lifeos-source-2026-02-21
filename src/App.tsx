import React, { createContext, useContext, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  CheckSquare, 
  Activity, 
  Target, 
  Wallet, 
  FileText, 
  LogOut, 
  Menu, 
  X,
  User as UserIcon,
  Plus,
  Search,
  Filter,
  Calendar,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Clock,
  Loader2,
  Bell,
  Settings as SettingsIcon,
  Download,
  Trash2,
  Moon,
  Sun,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Toaster, toast } from "sonner";
import { User, Notification, Task, Goal, Note } from "./types";
import { api } from "./lib/api";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Habits from "./pages/Habits";
import Goals from "./pages/Goals";
import Finance from "./pages/Finance";
import Notes from "./pages/Notes";
import Settings from "./pages/Settings";
import CalendarPage from "./pages/Calendar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Landing Pages
import Home from "./pages/landing/Home";
import Features from "./pages/landing/Features";
import About from "./pages/landing/About";
import Contact from "./pages/landing/Contact";
import Pricing from "./pages/landing/Pricing";
import Terms from "./pages/landing/Terms";
import Privacy from "./pages/landing/Privacy";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- UTILS ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- AUTH CONTEXT ---
interface AuthContextType {
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  loading: boolean;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser && token) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }
    setLoading(false);
  }, []);

  const login = (token: string, user: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      localStorage.setItem("user", JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- COMPONENTS ---
const SidebarItem = ({ icon: Icon, label, to, active, onClick, color }: { icon: any, label: string, to: string, active: boolean, onClick?: () => void, key?: string, color: string }) => {
  const colors: Record<string, string> = {
    indigo: active ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-200" : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600",
    emerald: active ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200" : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-600",
    rose: active ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-200" : "text-slate-600 hover:bg-rose-50 hover:text-rose-600",
    amber: active ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-200" : "text-slate-600 hover:bg-amber-50 hover:text-amber-600",
    blue: active ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-200" : "text-slate-600 hover:bg-blue-50 hover:text-blue-600",
    violet: active ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-200" : "text-slate-600 hover:bg-violet-50 hover:text-violet-600",
    slate: active ? "bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg shadow-slate-200" : "text-slate-600 hover:bg-slate-50 hover:text-slate-700",
  };
  
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300 group relative",
        colors[color] || colors.indigo
      )}
    >
      <Icon className={cn("w-5 h-5 transition-transform duration-300", active ? "text-white" : "group-hover:scale-110")} />
      <span className="font-bold text-sm tracking-tight">{label}</span>
    </Link>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => new Date());

  const calendarYear = calendarDate.getFullYear();
  const calendarMonth = calendarDate.getMonth();
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const startDay = new Date(calendarYear, calendarMonth, 1).getDay();
  const calendarCells = Array.from({ length: startDay + daysInMonth }, (_, i) => i - startDay + 1);
  const today = new Date();
  const isSameDay = (a: Date, b: Date) => (
    a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
  );

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await api.notifications.getAll();
      setNotifications(data);
    } catch (e) {
      console.error("Failed to fetch notifications");
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.notifications.markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (e) {
      toast.error("Failed to mark notification as read");
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === "n" && !["INPUT", "TEXTAREA"].includes((e.target as any).tagName)) {
        e.preventDefault();
        navigate("/tasks");
      }
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as any).tagName)) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        setIsCalendarOpen(false);
        setIsNotificationsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      try {
        const [tasks, goals, notes] = await Promise.all([
          api.tasks.getAll(),
          api.goals.getAll(),
          api.notes.getAll()
        ]);

        const results = [
          ...tasks.map((t: Task) => ({ type: "Task", title: t.title, link: "/tasks", icon: CheckSquare })),
          ...goals.map((g: Goal) => ({ type: "Goal", title: g.title, link: "/goals", icon: Target })),
          ...notes.map((n: Note) => ({ type: "Note", title: n.title, link: "/notes", icon: FileText }))
        ].filter((item: any) => item.title.toLowerCase().includes(searchQuery.toLowerCase()));

        setSearchResults(results);
      } catch (e) {
        console.error("Search failed");
      }
    };

    const debounce = setTimeout(performSearch, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const navItems = [
    { icon: LayoutDashboard, label: "Overview", to: "/dashboard", color: "indigo" },
    { icon: CheckSquare, label: "Tasks", to: "/tasks", color: "emerald" },
    { icon: Activity, label: "Habits", to: "/habits", color: "rose" },
    { icon: Calendar, label: "Calendar", to: "/calendar", color: "indigo" },
    { icon: Target, label: "Goals", to: "/goals", color: "amber" },
    { icon: Wallet, label: "Finance", to: "/finance", color: "blue" },
    { icon: FileText, label: "Notes", to: "/notes", color: "violet" },
    { icon: SettingsIcon, label: "Settings", to: "/settings", color: "slate" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchOpen(true);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-gradient-to-b from-white to-indigo-50/30 border-r border-indigo-100/60 shadow-xl sticky top-0 h-screen z-40">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2.5 mb-8 group">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-300/50 group-hover:rotate-6 group-hover:scale-110 transition-all">
              <Activity className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">my app</h1>
          </Link>

          <div className="space-y-1">
            <p className="px-3 text-[10px] font-black text-indigo-400 uppercase tracking-wider mb-4">Navigation</p>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <SidebarItem 
                  key={item.to} 
                  {...item} 
                  active={location.pathname === item.to} 
                />
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-auto p-6 border-t border-indigo-100/80 bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
          <div 
            onClick={() => navigate('/settings')}
            className="flex items-center gap-3 px-2 mb-6 group cursor-pointer hover:bg-white/50 rounded-lg py-2 transition-colors"
          >
            <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
              <UserIcon className="text-white w-5 h-5" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-black text-slate-900 truncate">{user?.name}</p>
              <p className="text-[9px] font-bold text-indigo-500 truncate uppercase tracking-wide">Premium</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 transition-all duration-300 font-bold text-xs uppercase tracking-wide shadow-lg shadow-rose-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-b border-indigo-100/60 z-50 px-5 py-4 flex items-center justify-between shadow-md">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-300/50">
            <Activity className="text-white w-5 h-5" />
          </div>
          <h1 className="text-lg font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">my app</h1>
        </Link>
        <button 
          onClick={() => setIsMobileMenuOpen(true)} 
          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-gradient-to-b from-white to-indigo-50/30 z-[110] p-6 shadow-2xl lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-300/50">
                    <Activity className="text-white w-5 h-5" />
                  </div>
                  <span className="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">my app</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-slate-400 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="space-y-1 flex-1">
                {navItems.map((item) => (
                  <SidebarItem 
                    key={item.to} 
                    {...item} 
                    active={location.pathname === item.to} 
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                ))}
              </nav>

              <div className="mt-auto pt-6 border-t border-indigo-100">
                <div 
                  onClick={() => { navigate('/settings'); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-3 mb-6 cursor-pointer hover:bg-indigo-50 rounded-lg p-2 transition-colors"
                >
                  <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
                    <UserIcon className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">{user?.name}</p>
                    <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-wide">Premium</p>
                  </div>
                </div>
                <button 
                  onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs uppercase tracking-wide shadow-lg shadow-rose-200"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pt-[70px] lg:pt-0">
        {/* Top Navigation Bar (Desktop) */}
        <header className="hidden lg:flex items-center justify-between h-20 px-6 xl:px-8 bg-white/80 backdrop-blur-xl border-b border-indigo-100/60 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div 
              onClick={() => setIsSearchOpen(true)}
              className="relative w-full group cursor-text"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 w-5 h-5 group-hover:text-indigo-600 transition-colors" />
              <div className="w-full pl-12 pr-5 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl text-sm font-bold text-slate-600 flex items-center justify-between transition-all hover:border-indigo-200 hover:shadow-md">
                <span>Search your my app...</span>
                <div className="flex items-center gap-1">
                  <span className="px-1.5 py-0.5 bg-white border border-indigo-200 rounded text-[10px] font-black text-indigo-600">⌘</span>
                  <span className="px-1.5 py-0.5 bg-white border border-indigo-200 rounded text-[10px] font-black text-indigo-600">K</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-3 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all shadow-sm hover:shadow relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full" />
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-[400px] bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden"
                    >
                      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Notifications</h3>
                        <button 
                          onClick={async () => {
                            await api.notifications.markAllAsRead();
                            fetchNotifications();
                          }}
                          className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                        >
                          Mark all as read
                        </button>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((n) => (
                            <div 
                              key={n.id} 
                              onClick={() => handleMarkAsRead(n.id)}
                              className={cn(
                                "p-6 border-b border-slate-50 last:border-0 transition-colors cursor-pointer group",
                                !n.is_read ? "bg-indigo-50/30 hover:bg-indigo-50/50" : "hover:bg-slate-50"
                              )}
                            >
                              <div className="flex gap-4">
                                <div className={cn(
                                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                  n.type === 'WELCOME' ? "bg-emerald-100 text-emerald-600" : "bg-indigo-100 text-indigo-600"
                                )}>
                                  <Bell className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-slate-900 text-sm truncate">{n.title}</p>
                                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">{n.message}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                                    {new Date(n.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                                {!n.is_read && (
                                  <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2" />
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-12 text-center">
                            <p className="text-slate-400 font-bold">No notifications yet</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={() => setIsCalendarOpen(true)}
              className="p-3 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all shadow-sm hover:shadow"
            >
              <Calendar className="w-5 h-5" />
            </button>
            <div className="h-8 w-px bg-indigo-100 mx-1" />
            <button 
              onClick={() => navigate("/tasks")}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold text-sm shadow-lg shadow-indigo-300/50 hover:from-indigo-700 hover:to-purple-700 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Quick Task</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-7 xl:p-8 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Global Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tasks, habits, goals..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-lg focus:ring-0 text-lg font-bold text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>
              <div className="max-h-[60vh] overflow-y-auto p-4">
                {searchQuery.trim() ? (
                  <div className="space-y-2">
                    {searchResults.length > 0 ? (
                      searchResults.map((result, i) => (
                        <button
                          key={i}
                          onClick={() => { navigate(result.link); setIsSearchOpen(false); }}
                          className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 transition-colors group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                              <result.icon className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                              <p className="font-bold text-slate-900">{result.title}</p>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{result.type}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                        </button>
                      ))
                    ) : (
                      <div className="py-12 text-center">
                        <p className="text-slate-400 font-bold">No results found for "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                      <Search className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-400 font-bold">Start typing to search your my app</p>
                  </div>
                )}
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-lg shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ESC</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">to close</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-lg shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ENTER</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">to select</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Calendar Modal */}
      <AnimatePresence>
        {isCalendarOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCalendarOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-indigo-600 text-white">
                <div>
                  <h2 className="text-2xl font-black tracking-tight">
                    {calendarDate.toLocaleString("en-US", { month: "long", year: "numeric" })}
                  </h2>
                  <p className="text-indigo-100 font-bold text-sm uppercase tracking-widest mt-1">
                    {selectedDate
                      ? `Selected: ${selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}`
                      : "Pick a date"}
                  </p>
                </div>
                <button 
                  onClick={() => setIsCalendarOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {["S", "M", "T", "W", "T", "F", "S"].map(day => (
                    <div key={day} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {calendarCells.map((day, i) => {
                    if (day <= 0) {
                      return <div key={`empty-${i}`} className="h-11" />;
                    }
                    const dateValue = new Date(calendarYear, calendarMonth, day);
                    const isToday = isSameDay(dateValue, today);
                    const isSelected = selectedDate ? isSameDay(dateValue, selectedDate) : false;
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedDate(dateValue)}
                        className={cn(
                          "h-11 rounded-lg font-bold transition-all flex items-center justify-center relative",
                          isSelected
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                            : isToday
                              ? "bg-indigo-50 text-indigo-600"
                              : "hover:bg-slate-50 text-slate-600"
                        )}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                    <span className="text-xs font-bold text-slate-500">Upcoming Events</span>
                  </div>
                  <button
                    onClick={() => { setIsCalendarOpen(false); navigate("/calendar"); }}
                    className="text-indigo-600 font-black uppercase tracking-widest text-[10px] hover:underline"
                  >
                    View Full Schedule
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
  </div>;
  if (!user) return <Navigate to="/login" />;
  return <Layout>{children}</Layout>;
};

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors closeButton />
      <BrowserRouter>
        <Routes>
          {/* Landing Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* App Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
          <Route path="/habits" element={<ProtectedRoute><Habits /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
          <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
          <Route path="/finance" element={<ProtectedRoute><Finance /></ProtectedRoute>} />
          <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
