import React from "react";
import LandingLayout from "../../components/LandingLayout";
import { motion } from "motion/react";
import { Activity, Heart, Target, Users } from "lucide-react";

export default function About() {
  return (
    <LandingLayout>
      <section className="pt-20 pb-12 lg:pt-32 lg:pb-20 mt-12">
        <div className="site-container">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[0.9] mb-8">
                Our mission is to help you <span className="text-indigo-600 italic">master</span> your life.
              </h1>
              <p className="text-xl text-slate-500 font-medium leading-relaxed">
                my app was born out of a simple need: a single place to track everything that matters. We believe that productivity isn't just about doing more, but about doing what matters most.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-slate-50/50">
        <div className="site-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Why my app?</h2>
              <p className="text-slate-500 font-medium leading-relaxed text-lg">
                In a world full of distractions, staying focused on your goals is harder than ever. We found ourselves jumping between five different apps to track tasks, habits, and money. It was exhausting.
              </p>
              <p className="text-slate-500 font-medium leading-relaxed text-lg">
                We built my app to solve our own problem. A unified dashboard that gives you the clarity you need to make better decisions every day. No fluff, no complex setups—just pure productivity.
              </p>
              <div className="grid grid-cols-2 gap-8 pt-8">
                <div>
                  <p className="text-4xl font-black text-indigo-600 mb-2">2024</p>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Founded</p>
                </div>
                <div>
                  <p className="text-4xl font-black text-indigo-600 mb-2">10k+</p>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Active Users</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://picsum.photos/seed/team/800/600" 
                alt="Our Team" 
                className="w-full h-auto rounded-xl shadow-premium"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="site-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ValueCard 
              icon={Heart}
              title="User First"
              description="Every feature we build starts with a real user problem. We listen, we iterate, and we improve."
            />
            <ValueCard 
              icon={Target}
              title="Simplicity"
              description="Productivity tools shouldn't be a chore. We strive for the most intuitive experience possible."
            />
            <ValueCard 
              icon={Activity}
              title="Transparency"
              description="We are open about our process, our data usage, and our roadmap. Trust is our foundation."
            />
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}

function ValueCard({ icon: Icon, title, description }: any) {
  return (
    <div className="text-center space-y-6 p-8 rounded-lg hover:bg-slate-50 transition-colors">
      <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mx-auto shadow-sm">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed">{description}</p>
    </div>
  );
}

