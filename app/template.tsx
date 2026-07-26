"use client";
import { motion } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
