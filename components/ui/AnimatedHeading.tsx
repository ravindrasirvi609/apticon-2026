"use client";
import { motion } from "framer-motion";
import { staggerFast, letterVariant } from "@/lib/animations";

interface Props {
  text: string;
  as?: "h1" | "h2" | "h3" | "h4";
  className?: string;
  delay?: number;
}

export default function AnimatedHeading({
  text,
  as = "h2",
  className,
  delay = 0,
}: Props) {
  const Tag = as;
  const words = text.split(" ");

  return (
    <Tag className={className} aria-label={text}>
      <motion.span
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={staggerFast}
        transition={{ delayChildren: delay }}
        className="inline-flex flex-wrap gap-x-[0.25em]"
      >
        {words.map((word, wi) => (
          <span key={wi} className="overflow-hidden inline-block">
            <motion.span variants={letterVariant} className="inline-block">
              {word}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}
