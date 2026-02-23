import React, { useState } from "react";
import LandingLayout from "../../components/LandingLayout";
import { motion } from "motion/react";
import { Mail, MessageSquare, Phone, Send, Loader2, CheckCircle2 } from "lucide-react";

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <LandingLayout>
      <section className="pt-20 pb-12 lg:pt-32 lg:pb-20 mt-12">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[0.9] mb-8">
                  Get in <span className="text-indigo-600 italic">touch.</span>
                </h1>
                <p className="text-xl text-slate-500 font-medium leading-relaxed mb-12">
                  Have questions about my app? Our team is here to help you get the most out of your dashboard.
                </p>

                <div className="space-y-8">
                  <ContactInfo 
                    icon={Mail}
                    title="Email Us"
                    value="hello@lifeos.app"
                  />
                  <ContactInfo 
                    icon={Phone}
                    title="Call Us"
                    value="+1 (555) 000-0000"
                  />
                  <ContactInfo 
                    icon={MessageSquare}
                    title="Live Chat"
                    value="Available 9am - 5pm EST"
                  />
                </div>
              </motion.div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-indigo-100 rounded-xl blur-2xl opacity-50 -z-10" />
              <div className="bg-white p-10 rounded-xl shadow-premium border border-slate-200/60">
                {isSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20"
                  >
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4">Message Sent!</h2>
                    <p className="text-slate-500 font-medium mb-8">We'll get back to you as soon as possible.</p>
                    <button 
                      onClick={() => setIsSuccess(false)}
                      className="text-indigo-600 font-black uppercase tracking-widest text-xs hover:underline"
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                      <input 
                        required
                        type="text"
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none font-bold text-slate-900 transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                      <input 
                        required
                        type="email"
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none font-bold text-slate-900 transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Message</label>
                      <textarea 
                        required
                        rows={5}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none font-bold text-slate-900 transition-all resize-none"
                        placeholder="How can we help?"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-indigo-600 text-white py-5 rounded-lg font-black text-lg hover:bg-indigo-700 transition-all shadow-[0_15px_30px_-5px_rgba(79,70,229,0.4)] flex items-center justify-center gap-3 disabled:opacity-70"
                    >
                      {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                        <>
                          <Send className="w-5 h-5" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}

function ContactInfo({ icon: Icon, title, value }: any) {
  return (
    <div className="flex items-center gap-6 group">
      <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-xl font-black text-slate-900 tracking-tight">{value}</p>
      </div>
    </div>
  );
}
