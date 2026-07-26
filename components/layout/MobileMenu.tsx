"use client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { mobileMenuVariants, staggerContainer, fadeUp } from "@/lib/animations";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
}

export default function MobileMenu({ isOpen, onClose, pathname }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.nav
            initial="closed"
            animate="open"
            exit="closed"
            variants={mobileMenuVariants}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-[var(--dark-text)] flex flex-col shadow-2xl"
            aria-label="Mobile navigation"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <span className="font-display font-bold text-lg text-[var(--gold-400)]">
                APTICON 2026
              </span>
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={22} />
              </button>
            </div>

            {/* Links */}
            <motion.ul
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="flex-1 overflow-y-auto py-6 px-4 space-y-1"
            >
              {NAV_LINKS.map((link) => {
                const active = pathname === link.href;
                return (
                  <motion.li key={link.href} variants={fadeUp}>
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className={`
                        flex items-center px-4 py-3 rounded-xl text-sm font-medium
                        transition-all duration-200
                        ${active
                          ? "bg-[var(--crimson-800)] text-[var(--gold-400)]"
                          : "text-white/80 hover:bg-white/8 hover:text-white"
                        }
                      `}
                    >
                      {link.label}
                      {active && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--gold-400)]" />
                      )}
                    </Link>
                  </motion.li>
                );
              })}
            </motion.ul>

            {/* CTA */}
            <div className="p-6 border-t border-white/10">
              <Link
                href="/registration"
                onClick={onClose}
                className="
                  block w-full text-center px-6 py-3 rounded-full
                  bg-[var(--gold-400)] text-[var(--dark-text)]
                  font-semibold text-sm tracking-wide
                  hover:bg-[var(--gold-300)] transition-colors
                "
              >
                Register Now
              </Link>
              <p className="mt-4 text-center text-xs text-white/40">
                apticon2026@gmail.com
              </p>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
