import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Wallet, 
  Target, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  ChevronRight,
  Flame
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";
import { api } from "../lib/api";
import { Task, Habit, Goal, FinanceEntry } from "../types";
import { useAuth } from "../App";
import { motion } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [finance, setFinance] = useState<FinanceEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [t, h, g, f] = await Promise.all([
          api.tasks.getAll(),
          api.habits.getAll(),
          api.goals.getAll(),
          api.finance.getAll()
        ]);
        setTasks(t);
        setHabits(h);
        setGoals(g);
        setFinance(f);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="space-y-8 animate-pulse">
      <div className="h-20 bg-slate-200 rounded-xl w-1/3" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-80 bg-slate-200 rounded-xl" />
        <div className="h-80 bg-slate-200 rounded-xl" />
      </div>
    </div>
  );

  const pendingTasks = tasks.filter(t => t.status === 'PENDING');
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED');
  
  // Productivity Score Logic
  const taskCompletionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) : 0;
  const habitCompletionRate = habits.length > 0 
    ? habits.reduce((acc, h) => acc + (h.logs.filter(l => l.completed).length / 7), 0) / habits.length 
    : 0;
  const productivityScore = Math.round((taskCompletionRate * 60) + (habitCompletionRate * 40));

  const totalIncome = finance.filter(f => f.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = finance.filter(f => f.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  const financeByCategory = finance
    .filter(f => f.type === 'EXPENSE')
    .reduce((acc: any, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});

  const pieData = Object.entries(financeByCategory).map(([name, value]) => ({ name, value }));

  // Performance Trend (Simulated)
  const isImproving = productivityScore > 50;

  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black text-slate-900 tracking-tight"
          >
            Good Morning, <span className="text-indigo-600">{user?.name?.split(' ')[0]}</span>
          </motion.h1>
          <p className="text-slate-500 mt-2 font-medium">Here's your productivity overview for today.</p>
        </div>
        <div className="flex items-center gap-4 bg-gradient-to-r from-indigo-50 to-purple-50 p-2 pr-6 rounded-xl border border-indigo-100 shadow-md">
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center font-black text-lg shadow-lg",
            productivityScore > 70 ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white" : "bg-gradient-to-br from-indigo-500 to-purple-500 text-white"
          )}>
            {productivityScore}
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Productivity Score</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isImproving ? <TrendingUp className="w-3 h-3 text-emerald-500" /> : <TrendingDown className="w-3 h-3 text-rose-500" />}
              <span className={cn("text-xs font-bold", isImproving ? "text-emerald-500" : "text-rose-500")}>
                {isImproving ? "Improving" : "Declining"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - Bento Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Net Balance" 
          value={`$${balance.toLocaleString()}`} 
          icon={Wallet} 
          trend={balance >= 0 ? "up" : "down"}
          color="indigo"
          description="Total liquid assets"
        />
        <StatCard 
          title="Tasks" 
          value={pendingTasks.length.toString()} 
          icon={CheckCircle2} 
          color="emerald"
          description={`${completedTasks.length} completed so far`}
        />
        <StatCard 
          title="Goals" 
          value={goals.length.toString()} 
          icon={Target} 
          color="amber"
          description="Active targets"
        />
        <StatCard 
          title="Habits" 
          value={habits.length.toString()} 
          icon={Activity} 
          color="rose"
          description="Daily streaks"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Analytics */}
        <div className="lg:col-span-8 space-y-8">
          {/* Finance Chart */}
          <div className="bg-white p-8 rounded-xl border border-indigo-100/60 shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
            {/* Decorative Background */}
            <div className="absolute top-0 left-0 w-56 h-56 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full -ml-28 -mt-28 blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tr from-blue-100 to-cyan-100 rounded-full -mr-20 -mb-20 blur-xl opacity-40" />
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                    <ArrowUpRight className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Cash Flow</h3>
                </div>
                <p className="text-sm text-slate-500 font-medium ml-13">Monthly income vs expenses</p>
              </div>
              <select className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-100 text-xs font-bold text-indigo-600 rounded-xl px-4 py-2.5 outline-none cursor-pointer hover:from-indigo-100 hover:to-purple-100 hover:border-indigo-200 transition-all shadow-sm">
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
              </select>
            </div>
            <div className="h-[320px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { name: 'Week 1', income: totalIncome * 0.2, expense: totalExpense * 0.3 },
                  { name: 'Week 2', income: totalIncome * 0.5, expense: totalExpense * 0.4 },
                  { name: 'Week 3', income: totalIncome * 0.8, expense: totalExpense * 0.7 },
                  { name: 'Week 4', income: totalIncome, expense: totalExpense },
                ]}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="income" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorIncome)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expense" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    fill="transparent"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tasks & Habits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Today's Tasks Card */}
            <div className="bg-white p-8 rounded-xl border border-emerald-100/60 shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full -mr-24 -mt-24 blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Today's Tasks</h3>
                </div>
                <button 
                  onClick={() => navigate('/tasks')}
                  className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl text-white hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-200 hover:scale-110 hover:rotate-12"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3 relative z-10">
                {pendingTasks.slice(0, 3).map(task => (
                  <div 
                    key={task.id} 
                    onClick={() => navigate('/tasks')}
                    className="group/item flex items-center gap-4 p-4 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-emerald-100 hover:shadow-md"
                  >
                    <div className={cn(
                      "w-1.5 h-10 rounded-full shadow-lg",
                      task.priority === 'HIGH' ? "bg-gradient-to-b from-rose-500 to-pink-500" : task.priority === 'MEDIUM' ? "bg-gradient-to-b from-amber-500 to-orange-500" : "bg-gradient-to-b from-indigo-500 to-purple-500"
                    )} />
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-slate-900 group-hover/item:text-emerald-600 transition-colors">{task.title}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1">{task.category}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover/item:text-emerald-500 opacity-0 group-hover/item:opacity-100 transition-all" />
                  </div>
                ))}
                {pendingTasks.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>
                    <p className="text-sm text-slate-400 font-medium">No pending tasks</p>
                    <p className="text-xs text-slate-300 mt-1">You're all caught up! 🎉</p>
                  </div>
                )}
              </div>
            </div>

            {/* Habit Streaks Card */}
            <div className="bg-white p-8 rounded-xl border border-rose-100/60 shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
              {/* Decorative Background */}
              <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full -ml-24 -mt-24 blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-200">
                    <Flame className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-black bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">Habit Streaks</h3>
                </div>
                <button 
                  onClick={() => navigate('/habits')}
                  className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl text-white hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg shadow-rose-200 hover:scale-110 hover:rotate-12"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4 relative z-10">
                {habits.slice(0, 3).map(habit => (
                  <div 
                    key={habit.id} 
                    onClick={() => navigate('/habits')}
                    className="flex items-center justify-between p-4 hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 rounded-xl transition-all border border-transparent hover:border-rose-100 hover:shadow-md group/item cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover/item:scale-110 transition-transform">
                        <Activity className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-900 block">{habit.name}</span>
                        <span className="text-xs text-slate-400 font-medium">{habit.frequency}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                      <Flame className="w-5 h-5 text-amber-500" />
                      <span className="font-black text-lg text-amber-600">5</span>
                    </div>
                  </div>
                ))}
                {habits.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-pink-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Activity className="w-8 h-8 text-rose-500" />
                    </div>
                    <p className="text-sm text-slate-400 font-medium">No habits set</p>
                    <p className="text-xs text-slate-300 mt-1">Start building healthy habits!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Goals & Breakdown */}
        <div className="lg:col-span-4 space-y-8">
          {/* Goals Card */}
          <div className="bg-white p-8 rounded-xl border border-amber-100/60 shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full -mr-20 -mt-20 blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-indigo-100 to-purple-100 rounded-full -ml-16 -mb-16 blur-xl opacity-40" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-200">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Goal Progress</h3>
              </div>
              <div className="space-y-6">
                {goals.slice(0, 3).map(goal => {
                  const progress = (goal.current_value / goal.target_value) * 100;
                  return (
                    <div 
                      key={goal.id} 
                      onClick={() => navigate('/goals')}
                      className="p-4 bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-xl border border-amber-100 hover:shadow-md transition-all group/item cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-bold text-slate-900 text-sm">{goal.title}</span>
                        <span className="font-black text-amber-600 text-lg">{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full h-2 bg-white rounded-full overflow-hidden shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-lg"
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs">
                        <span className="text-slate-500 font-medium">{goal.current_value.toLocaleString()} / {goal.target_value.toLocaleString()}</span>
                        <span className="text-amber-600 font-bold">{new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  );
                })}
                {goals.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Target className="w-8 h-8 text-amber-500" />
                    </div>
                    <p className="text-sm text-slate-400 font-medium">No active goals</p>
                    <p className="text-xs text-slate-300 mt-1">Set your first goal!</p>
                  </div>
                )}
              </div>
              <button 
                onClick={() => navigate("/goals")}
                className="w-full mt-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-amber-200 hover:shadow-xl hover:scale-[1.02]"
              >
                View All Goals
              </button>
            </div>
          </div>

          {/* Expense Pie */}
          <div className="bg-white p-8 rounded-xl border border-blue-100/60 shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
            {/* Decorative Background */}
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full -mr-20 -mb-20 blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Spending</h3>
              </div>
              <div className="h-56">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={8}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center mb-3">
                      <Wallet className="w-8 h-8 text-blue-500" />
                    </div>
                    <p className="text-slate-400 font-medium text-sm">No spending data</p>
                  </div>
                )}
              </div>
              <div className="mt-6 space-y-3">
                {pieData.slice(0, 3).map((item, i) => (
                  <div 
                    key={item.name} 
                    onClick={() => navigate('/finance')}
                    className="flex items-center justify-between p-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 rounded-lg transition-all border border-transparent hover:border-blue-100 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shadow-md" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-xs font-bold text-slate-600">{item.name}</span>
                    </div>
                    <span className="text-sm font-black text-slate-900">${item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, color, description }: { title: string, value: string, icon: any, trend?: "up" | "down", color: string, description: string }) {
  const colorClasses: any = {
    indigo: "bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-200",
    emerald: "bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-200",
    amber: "bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-200",
    rose: "bg-gradient-to-br from-rose-500 to-pink-500 shadow-lg shadow-rose-200",
  };

  return (
    <motion.div 
      whileHover={{ y: -6, scale: 1.02 }}
      className="bg-white p-6 rounded-xl border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 group"
    >
      <div className="flex items-center justify-between mb-6">
        <div className={cn("p-3 rounded-lg transition-transform duration-300 group-hover:scale-110", colorClasses[color])}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider",
            trend === "up" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          )}>
            {trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend === "up" ? "Growth" : "Drop"}
          </div>
        )}
      </div>
      <div>
        <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.1em]">{title}</p>
        <h4 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">{value}</h4>
        <p className="text-[11px] text-slate-400 mt-2 font-medium">{description}</p>
      </div>
    </motion.div>
  );
}
