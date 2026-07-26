"use client";
import { motion, type Variants } from "framer-motion";
import { useRef } from "react";
import { fadeUp } from "@/lib/animations";

interface Props {
  children: React.ReactNode;
  variants?: Variants;
  className?: string;
  delay?: number;
  once?: boolean;
}

export default function ScrollReveal({
  children,
  variants = fadeUp,
  className,
  delay = 0,
  once = true,
}: Props) {
  const ref = useRef(null);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-80px" }}
      variants={variants}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
