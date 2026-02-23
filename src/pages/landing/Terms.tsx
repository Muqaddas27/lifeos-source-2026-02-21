import React from "react";
import LandingLayout from "../../components/LandingLayout";

export default function Terms() {
  return (
    <LandingLayout>
      <section className="pt-20 pb-12 lg:pt-32 lg:pb-20 mt-12">
        <div className="max-w-4xl mx-auto px-6 md:px-10">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-12 italic">Terms & Conditions</h1>
          
          <div className="prose prose-slate max-w-none space-y-8 text-slate-600 font-medium leading-relaxed">
            <p className="text-xl text-slate-900 font-black tracking-tight">Last Updated: February 20, 2026</p>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">1. Acceptance of Terms</h2>
              <p>By accessing and using my app, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our services.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">2. Use of Service</h2>
              <p>my app provides a personal productivity dashboard. You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">3. User Content</h2>
              <p>You retain all rights to the data you enter into my app. However, by using the service, you grant us the right to process this data to provide the service to you.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">4. Prohibited Activities</h2>
              <p>You may not use my app for any illegal or unauthorized purpose. You must not, in the use of the Service, violate any laws in your jurisdiction.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">5. Limitation of Liability</h2>
              <p>my app shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use the service.</p>
            </section>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
