"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { Button } from "@/components/ui/shadcn/button";

export default function SuccessActions() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
    >
      <Link href="/registration/status">
        <Button variant="outline">Check Status</Button>
      </Link>
      <Link href="/abstracts">
        <Button>Submit an Abstract</Button>
      </Link>
    </motion.div>
  );
}
