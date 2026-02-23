import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { motion } from "motion/react";

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FDFDFF] selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />
      <main>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
