import React from "react";
import LandingLayout from "../../components/LandingLayout";

export default function Privacy() {
  return (
    <LandingLayout>
      <section className="pt-20 pb-12 lg:pt-32 lg:pb-20 mt-12">
        <div className="max-w-4xl mx-auto px-6 md:px-10">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-12 italic">Privacy Policy</h1>
          
          <div className="prose prose-slate max-w-none space-y-8 text-slate-600 font-medium leading-relaxed">
            <p className="text-xl text-slate-900 font-black tracking-tight">Last Updated: February 20, 2026</p>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">1. Information We Collect</h2>
              <p>We collect information you provide directly to us when you create an account, such as your name and email address. We also collect the data you enter into your dashboard (tasks, habits, finances) to provide the service.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">2. How We Use Your Information</h2>
              <p>We use the information we collect to provide, maintain, and improve our services, to develop new ones, and to protect my app and our users.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">3. Data Security</h2>
              <p>We use industry-standard security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">4. Third-Party Services</h2>
              <p>We do not sell your personal information to third parties. We may use third-party service providers to help us operate our business and the service.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">5. Your Rights</h2>
              <p>You have the right to access, update, or delete your personal information at any time through your account settings.</p>
            </section>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
