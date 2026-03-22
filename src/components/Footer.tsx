import React from "react";
import { Link } from "react-router-dom";
import { Activity, Github, Linkedin, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200/60 pt-20 pb-10">
      <div className="site-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-indigo-200 shadow-lg">
                <Activity className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tighter italic">my app</span>
            </Link>
            <p className="text-slate-500 font-medium leading-relaxed max-w-xs">
              The all-in-one personal productivity dashboard designed to help you master your habits, tasks, and finances.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-slate-900 font-black uppercase tracking-widest text-xs mb-8">Product</h4>
            <ul className="space-y-4">
              <li><Link to="/features" className="text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors">Pricing</Link></li>
              <li><Link to="/dashboard" className="text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors">Live Demo</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 font-black uppercase tracking-widest text-xs mb-8">Company</h4>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors">Contact</Link></li>
              <li><Link to="/blog" className="text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 font-black uppercase tracking-widest text-xs mb-8">Legal</h4>
            <ul className="space-y-4">
              <li><Link to="/privacy" className="text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors">Terms of Service</Link></li>
              <li><Link to="/cookie-policy" className="text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            © 2026 my app. All rights reserved.
          </p>
          <div className="flex items-center gap-8">
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Built with Passion</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">System Operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

