import React from "react";
import LandingLayout from "../../components/LandingLayout";
import { motion } from "motion/react";
import { Check, Zap, Star, Crown } from "lucide-react";
import { Link } from "react-router-dom";

export default function Pricing() {
  return (
    <LandingLayout>
      <section className="pt-20 pb-12 lg:pt-32 lg:pb-20 mt-12">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[0.9] mb-8">
                Simple, <span className="text-indigo-600 italic">transparent</span> pricing.
              </h1>
              <p className="text-xl text-slate-500 font-medium leading-relaxed">
                Choose the plan that works for you. No hidden fees, no surprises.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard 
              icon={Star}
              tier="Free"
              price="0"
              description="Perfect for individuals just getting started."
              features={["Up to 10 Tasks", "3 Habits Tracking", "Basic Finance Summary", "Community Support"]}
              cta="Get Started"
              highlight={false}
            />
            <PricingCard 
              icon={Zap}
              tier="Pro"
              price="12"
              description="For power users who want full control."
              features={["Unlimited Tasks", "Unlimited Habits", "Advanced Finance Analytics", "Priority Support", "Goal Tracking"]}
              cta="Start Pro Trial"
              highlight={true}
            />
            <PricingCard 
              icon={Crown}
              tier="Lifetime"
              price="199"
              description="One-time payment for eternal productivity."
              features={["Everything in Pro", "Lifetime Updates", "Exclusive Themes", "Early Access to Beta Features"]}
              cta="Buy Lifetime"
              highlight={false}
            />
          </div>
        </div>
      </section>

      {/* FAQ or Comparison could go here */}
    </LandingLayout>
  );
}

function PricingCard({ icon: Icon, tier, price, description, features, cta, highlight }: any) {
  return (
    <div className={`relative p-10 rounded-xl border transition-all duration-300 flex flex-col ${
      highlight 
        ? 'bg-slate-900 text-white border-slate-800 shadow-2xl scale-105 z-10' 
        : 'bg-white text-slate-900 border-slate-200/60 shadow-premium hover:shadow-premium-hover'
    }`}>
      {highlight && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
          Most Popular
        </div>
      )}
      
      <div className="flex items-center gap-4 mb-8">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${highlight ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-2xl font-black tracking-tight">{tier}</h3>
      </div>

      <div className="mb-8">
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-black tracking-tighter">${price}</span>
          {price !== "199" && <span className={`text-sm font-bold ${highlight ? 'text-slate-400' : 'text-slate-500'}`}>/month</span>}
        </div>
        <p className={`mt-4 text-sm font-medium ${highlight ? 'text-slate-400' : 'text-slate-500'}`}>{description}</p>
      </div>

      <ul className="space-y-4 mb-12 flex-1">
        {features.map((f: string) => (
          <li key={f} className="flex items-center gap-3 text-sm font-bold">
            <Check className={`w-5 h-5 ${highlight ? 'text-indigo-400' : 'text-indigo-600'}`} />
            {f}
          </li>
        ))}
      </ul>

      <Link
        to="/signup"
        className={`w-full py-4 rounded-lg font-black text-center transition-all ${
          highlight 
            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-[0_15px_30px_-5px_rgba(79,70,229,0.4)]' 
            : 'bg-slate-50 text-slate-900 hover:bg-slate-100'
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}
