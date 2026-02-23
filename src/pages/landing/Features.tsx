import React from "react";
import LandingLayout from "../../components/LandingLayout";
import { motion } from "motion/react";
import { 
  CheckSquare, 
  Activity, 
  Target, 
  Wallet, 
  BarChart3, 
  Zap,
  LayoutDashboard,
  Clock,
  Shield,
  Smartphone
} from "lucide-react";

export default function Features() {
  return (
    <LandingLayout>
      <section className="pt-20 pb-12 lg:pt-32 lg:pb-20 bg-slate-50/50 mt-12">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex flex-wrap gap-2 mb-8">
                <span className="px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest border border-indigo-100">Tasks</span>
                <span className="px-3 py-1.5 rounded-full bg-rose-50 text-rose-600 text-xs font-black uppercase tracking-widest border border-rose-100">Habits</span>
                <span className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 text-xs font-black uppercase tracking-widest border border-amber-100">Goals</span>
                <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest border border-blue-100">Finance</span>
                <span className="px-3 py-1.5 rounded-full bg-violet-50 text-violet-600 text-xs font-black uppercase tracking-widest border border-violet-100">Notes</span>
                <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-black uppercase tracking-widest border border-emerald-100">Calendar</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[0.9] mb-8">
                Powerful tools for <br /> <span className="text-indigo-600 italic">unstoppable</span> growth.
              </h1>
              <p className="text-xl text-slate-500 font-medium leading-relaxed">
                my app is built with a simple philosophy: if you can measure it, you can master it. Explore the modules that make my app the ultimate productivity engine.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-10 space-y-20">
          <FeatureSection 
            icon={CheckSquare}
            title="Task Management"
            subtitle="Never miss a deadline again."
            description="Our task system is designed for clarity. Organize your work by priority, category, and due date. With our intuitive interface, you can focus on what matters most and clear your backlog with ease."
              image="https://images.unsplash.com/photo-1454165205744-3b78555e5572?auto=format&fit=crop&w=1200&q=80"
            features={["Priority Levels", "Category Tagging", "Deadline Tracking", "Status Toggling"]}
            reversed={false}
          />

          <FeatureSection 
            icon={Activity}
            title="Habit Tracking"
            subtitle="Consistency is the key to success."
            description="Build lasting habits with our visual tracking system. See your streaks grow and monitor your monthly consistency. Whether it's reading, working out, or meditating, my app keeps you accountable."
              image="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80"
            features={["Streak Calculations", "Monthly Heatmaps", "Daily Logging", "Progress Visualization"]}
            reversed={true}
          />

          <FeatureSection 
            icon={Wallet}
            title="Finance Tracker"
            subtitle="Take control of your wealth."
            description="Monitor your cash flow with precision. Track every income and expense, categorize your spending, and see your total balance in real-time. Financial freedom starts with awareness."
              image="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80"
            features={["Income/Expense Logging", "Category Breakdown", "Balance Overview", "Transaction History"]}
            reversed={false}
          />

          <FeatureSection 
            icon={BarChart3}
            title="Analytics Dashboard"
            subtitle="Data-driven self-improvement."
            description="Visualize your progress with beautiful, interactive charts. Understand your spending patterns, habit consistency, and task completion rates. Turn your data into actionable insights."
              image="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80"
            features={["Interactive Area Charts", "Pie Chart Breakdowns", "Real-time Updates", "Comprehensive Summaries"]}
            reversed={true}
          />
        </div>
      </section>

      {/* Grid of smaller features */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
              Why teams choose my app
            </h2>
            <p className="text-slate-500 font-medium max-w-2xl mx-auto text-lg">
              Purpose-built for modern teams. Trusted by high performers everywhere.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <SmallFeature 
              icon={Zap}
              title="Lightning Fast"
              description="Built on a modern stack for near-instant load times and smooth interactions."
              color="indigo"
            />
            <SmallFeature 
              icon={Shield}
              title="Secure Data"
              description="Your data is encrypted and stored securely. We never sell your personal information."
              color="emerald"
            />
            <SmallFeature 
              icon={Smartphone}
              title="Fully Responsive"
              description="Access your dashboard from any device. Mobile, tablet, or desktop."
              color="rose"
            />
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}

function FeatureSection({ icon: Icon, title, subtitle, description, image, features, reversed }: any) {
  return (
    <div className={`flex flex-col lg:flex-row items-center gap-20 ${reversed ? 'lg:flex-row-reverse' : ''}`}>
      <div className="flex-1 space-y-8">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
          <Icon className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">{title}</h2>
          <p className="text-indigo-600 font-bold text-lg">{subtitle}</p>
        </div>
        <p className="text-slate-500 font-medium leading-relaxed text-lg">
          {description}
        </p>
        <ul className="grid grid-cols-2 gap-4">
          {features.map((f: string) => (
            <li key={f} className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Zap className="w-4 h-4 text-indigo-500 fill-indigo-500" />
              {f}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1 w-full">
        <div className="p-4 bg-white rounded-xl shadow-premium border border-slate-200/60">
          <img src={image} alt={title} className="w-full h-auto rounded-lg" referrerPolicy="no-referrer" />
        </div>
      </div>
    </div>
  );
}

function SmallFeature({ icon: Icon, title, description, color }: any) {
  const colorMap: any = {
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600", icon: "bg-indigo-100" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", icon: "bg-emerald-100" },
    rose: { bg: "bg-rose-50", text: "text-rose-600", icon: "bg-rose-100" },
  };

  const colors = colorMap[color] || colorMap.indigo;

  return (
    <div className={`p-8 rounded-lg border border-slate-200/60 shadow-sm hover:shadow-lg hover:-translate-y-2 transition-all duration-300 group ${colors.bg}`}>
      <div className={`w-14 h-14 ${colors.icon} rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
        <Icon className={`w-7 h-7 ${colors.text}`} />
      </div>
      <h3 className="text-xl font-black text-slate-900 tracking-tight mb-3">{title}</h3>
      <p className="text-slate-600 font-medium leading-relaxed text-sm">{description}</p>
    </div>
  );
}
