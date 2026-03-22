import React from "react";
import { motion } from "motion/react";
import { 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Shield, 
  BarChart3, 
  Users, 
  LayoutDashboard,
  Target,
  Activity,
  Wallet
} from "lucide-react";
import { Link } from "react-router-dom";
import LandingLayout from "../../components/LandingLayout";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Home() {
  return (
    <LandingLayout>
      {/* Hero Section */}
      <section className="relative pt-20 pb-12 lg:pt-32 lg:pb-20 overflow-hidden mt-12">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/50 blur-[120px] rounded-full" />
          <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-rose-100/50 blur-[120px] rounded-full" />
        </div>

        <div className="site-container">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest mb-8 border border-indigo-100">
                <Zap className="w-3 h-3 fill-indigo-600" />
                The Future of Personal Productivity
              </span>
              <h1 className="text-5xl md:text-7xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[0.95] mb-8">
                Master Your Life <br />
                <span className="text-indigo-600 italic">One Habit</span> at a Time.
              </h1>
              <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl lg:max-w-none mx-auto lg:mx-0 mb-10 leading-relaxed">
                my app is the all-in-one dashboard to manage your tasks, habits, goals, and finances. Built for high-performers who want to take control.
              </p>
              <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4">
                <Link
                  to="/signup"
                  className="w-full sm:w-auto bg-indigo-600 text-white px-10 py-5 rounded-lg font-black text-lg hover:bg-indigo-700 transition-all shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] flex items-center justify-center gap-2 group"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto bg-white text-slate-900 px-10 py-5 rounded-lg font-black text-lg border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  View Live Demo
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-8 bg-indigo-100/70 blur-[80px] rounded-full" />
              <div className="relative bg-white p-4 rounded-xl shadow-2xl border border-slate-200/60">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80" 
                  alt="my app Dashboard Preview" 
                  className="w-full h-auto rounded-lg shadow-sm"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-white p-2 rounded-lg border border-slate-200/60 shadow-sm">
                  <img
                    src="https://images.unsplash.com/photo-1545239351-ef35f43d514b?auto=format&fit=crop&w=600&q=80"
                    alt="Task planning board"
                    className="w-full h-24 object-cover rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200/60 shadow-sm">
                  <img
                    src="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=600&q=80"
                    alt="Habit tracking overview"
                    className="w-full h-24 object-cover rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200/60 shadow-sm">
                  <img
                    src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=600&q=80"
                    alt="Finance analytics dashboard"
                    className="w-full h-24 object-cover rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-slate-50/50">
        <div className="site-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">
              Everything you need to <br /> <span className="text-indigo-600">stay on top.</span>
            </h2>
            <p className="text-slate-500 font-medium max-w-xl mx-auto">
              Stop jumping between apps. my app brings your entire digital life into a single, beautiful workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={LayoutDashboard}
              title="Smart Dashboard"
              description="A bird's eye view of your day, week, and month. All your data at a glance."
              color="indigo"
            />
            <FeatureCard 
              icon={CheckCircle2}
              title="Task Management"
              description="Powerful task tracking with priorities, categories, and deadlines."
              color="emerald"
            />
            <FeatureCard 
              icon={Activity}
              title="Habit Tracking"
              description="Build lasting habits with visual streaks and monthly consistency charts."
              color="rose"
            />
            <FeatureCard 
              icon={Wallet}
              title="Finance Tracker"
              description="Monitor your cash flow, expenses, and savings goals in real-time."
              color="amber"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="site-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-8">
                Designed for <br /> <span className="text-indigo-600 italic underline decoration-indigo-200">Consistency.</span>
              </h2>
              <div className="space-y-8">
                <Step 
                  number="01"
                  title="Connect Your Life"
                  description="Sign up and set your core goals. Whether it's fitness, career, or finance, my app adapts to you."
                />
                <Step 
                  number="02"
                  title="Daily Execution"
                  description="Log your habits, complete your tasks, and track your spending with our intuitive interface."
                />
                <Step 
                  number="03"
                  title="Analyze & Optimize"
                  description="Use our powerful analytics to see where you're winning and where you need to improve."
                />
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-indigo-100 rounded-xl blur-2xl opacity-50 -z-10" />
              <div className="bg-white p-8 rounded-xl shadow-premium border border-slate-200/60">
                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80" 
                  alt="Analytics Preview" 
                  className="w-full h-auto rounded-lg"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-500 blur-[150px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600 blur-[120px] rounded-full" />
        </div>

        <div className="site-container relative z-10">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest mb-6 border border-indigo-100">
              <Users className="w-3 h-3" />
              Success Stories
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
              Trusted by builders & <span className="text-indigo-600">high performers</span>
            </h2>
            <p className="text-slate-500 font-medium max-w-2xl mx-auto text-lg">Join 10,000+ users who've transformed their productivity</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <TestimonialCard 
              quote="my app changed how I view my day. I've never been more consistent with my habits."
              author="Sarah Jenkins"
              role="Product Designer"
            />
            <TestimonialCard 
              quote="The finance tracker alone is worth it. Finally, an app that doesn't feel like a chore."
              author="Marcus Chen"
              role="Software Engineer"
            />
            <TestimonialCard 
              quote="Clean, fast, and powerful. It's the only productivity tool I use now."
              author="Elena Rodriguez"
              role="Founder @ TechFlow"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-screen mx-[calc(50%-50vw)] py-16 bg-slate-50/50">
        <div className="site-container">
          <div className="bg-indigo-600 rounded-xl p-8 md:p-12 text-center text-white relative overflow-hidden shadow-[0_40px_80px_-20px_rgba(79,70,229,0.5)]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-8">
                Ready to take control <br /> of your life?
              </h2>
              <p className="text-indigo-100 text-lg font-medium mb-12 max-w-xl mx-auto">
                Join thousands of users who are mastering their time and achieving their goals with my app.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/signup"
                  className="w-full sm:w-auto bg-white text-indigo-600 px-10 py-5 rounded-lg font-black text-lg hover:bg-slate-50 transition-all shadow-xl"
                >
                  Get Started for Free
                </Link>
                <Link
                  to="/contact"
                  className="w-full sm:w-auto bg-indigo-700 text-white px-10 py-5 rounded-lg font-black text-lg hover:bg-indigo-800 transition-all border border-indigo-500"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}

function FeatureCard({ icon: Icon, title, description, color }: any) {
  const colors: any = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="bg-white p-8 rounded-lg border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
      <div className={cn("w-14 h-14 rounded-lg flex items-center justify-center mb-8 group-hover:scale-110 transition-transform", colors[color])}>
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight">{title}</h3>
      <p className="text-slate-500 font-medium text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function Step({ number, title, description }: any) {
  return (
    <div className="flex gap-8">
      <span className="text-4xl font-black text-indigo-100 leading-none">{number}</span>
      <div>
        <h4 className="text-xl font-black text-slate-900 mb-3 tracking-tight">{title}</h4>
        <p className="text-slate-500 font-medium leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function TestimonialCard({ quote, author, role }: any) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const colors = [
    { bg: "bg-indigo-500" },
    { bg: "bg-emerald-500" },
    { bg: "bg-rose-500" },
  ];

  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  return (
    <div className="group bg-white border border-slate-200/60 p-8 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-2 transition-all duration-300">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 ${randomColor.bg} rounded-full flex items-center justify-center font-black text-sm text-white shadow-lg`}>
            {getInitials(author)}
          </div>
          <div>
            <p className="font-black text-slate-900 tracking-tight">{author}</p>
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-0.5">{role}</p>
          </div>
        </div>
      </div>
      <div className="flex gap-1 mb-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg key={i} className="w-4 h-4 fill-amber-400 text-amber-400" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      <p className="text-base font-medium text-slate-600 leading-relaxed italic">"{quote}"</p>
    </div>
  );
}

