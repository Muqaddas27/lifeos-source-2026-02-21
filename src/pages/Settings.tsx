import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  User as UserIcon, 
  Mail, 
  Lock, 
  Globe, 
  Trash2, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight
} from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../App";
import { toast } from "sonner";
import { ActivityLog } from "../types";

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [settings, setSettings] = useState({
    name: user?.name || "",
    email: user?.email || "",
    timezone: user?.timezone || "UTC",
    password: "",
    confirmPassword: ""
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const data = await api.activityLogs.getAll();
      setLogs(data);
    } catch (e) {
      console.error("Failed to fetch logs");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (settings.password && settings.password !== settings.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await api.user.updateSettings({
        name: settings.name,
        email: settings.email,
        timezone: settings.timezone,
        password: settings.password || undefined
      });
      updateUser({
        name: settings.name,
        email: settings.email,
        timezone: settings.timezone
      });
      toast.success("Settings updated successfully");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <header>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-xs">Manage your account and preferences</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Profile & Preferences */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-xl shadow-lg p-10 border border-slate-100">
            <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <UserIcon className="w-6 h-6 text-indigo-600" />
              Profile Information
            </h2>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      value={settings.name}
                      onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none font-bold text-slate-900 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none font-bold text-slate-900 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="password"
                      placeholder="Leave blank to keep current"
                      value={settings.password}
                      onChange={(e) => setSettings({ ...settings, password: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none font-bold text-slate-900 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="password"
                      value={settings.confirmPassword}
                      onChange={(e) => setSettings({ ...settings, confirmPassword: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none font-bold text-slate-900 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 text-white px-8 py-4 rounded-lg font-black text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2 disabled:opacity-70"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                  Save Changes
                </button>
              </div>
            </form>
          </section>

          <section className="bg-white rounded-xl shadow-premium p-10 border border-slate-100">
            <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <Globe className="w-6 h-6 text-indigo-600" />
              Preferences
            </h2>
            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-4">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Timezone</label>
                <select 
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none font-bold text-slate-900 transition-all appearance-none"
                >
                  <option value="UTC">UTC (GMT+0)</option>
                  <option value="EST">EST (GMT-5)</option>
                  <option value="PST">PST (GMT-8)</option>
                  <option value="CET">CET (GMT+1)</option>
                  <option value="IST">IST (GMT+5:30)</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        {/* Activity Log */}
        <div className="space-y-8">
          <section className="bg-white rounded-xl shadow-lg p-10 border border-slate-100 h-full">
            <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <Clock className="w-6 h-6 text-indigo-600" />
              Activity Log
            </h2>
            <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <div key={log.id} className="relative pl-12 group">
                    <div className="absolute left-0 top-1 w-10 h-10 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center z-10 group-hover:border-indigo-200 transition-colors">
                      <div className="w-2 h-2 bg-slate-300 rounded-full group-hover:bg-indigo-500 transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{log.details}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{log.action}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center">
                  <p className="text-slate-400 font-bold">No activity yet</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
