import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Activity } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-500",
        isScrolled 
          ? "bg-white/80 backdrop-blur-xl border-b border-slate-200/60 py-4 shadow-sm" 
          : "bg-transparent py-6"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-indigo-200 shadow-lg group-hover:rotate-6 transition-transform">
            <Activity className="text-white w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tighter italic">my app</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={cn(
                "text-sm font-bold transition-colors",
                location.pathname === link.href 
                  ? "text-indigo-600" 
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link 
            to="/login" 
            className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          onClick={() => setIsMobileMenuOpen(true)}
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
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-white z-[120] p-8 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <Activity className="text-white w-4 h-4" />
                  </div>
                  <span className="text-xl font-black text-slate-900 italic">my app</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex flex-col gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "text-xl font-black tracking-tight transition-colors",
                      location.pathname === link.href ? "text-indigo-600" : "text-slate-400 hover:text-slate-900"
                    )}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto space-y-4">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center py-4 rounded-lg font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center py-4 rounded-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
