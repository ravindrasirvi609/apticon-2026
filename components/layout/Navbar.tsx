"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Menu } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import MobileMenu from "./MobileMenu";

const PRIMARY_LINKS = NAV_LINKS.slice(0, 7);
const SECONDARY_LINKS = NAV_LINKS.slice(7);

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { scrollY } = useScroll();

  const navBg = useTransform(
    scrollY,
    [0, 80],
    ["rgba(255,253,231,0)", "rgba(255,253,231,0.96)"]
  );
  const navShadow = useTransform(
    scrollY,
    [0, 80],
    ["0 0 0 rgba(139,26,26,0)", "0 2px 24px rgba(139,26,26,0.12)"]
  );

  useEffect(() => {
    const unsub = scrollY.on("change", (v) => setScrolled(v > 60));
    return unsub;
  }, [scrollY]);

  return (
    <>
      <motion.header
        style={{
          backgroundColor: navBg as unknown as string,
          boxShadow: navShadow as unknown as string,
          backdropFilter: scrolled ? "blur(12px)" : "none",
        }}
        className="w-full transition-[backdrop-filter] duration-300"
      >
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-[var(--crimson-900)] via-[var(--gold-500)] to-[var(--navy-800)]" />

        <div className="container-site">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo / Brand */}
            <Link href="/" className="flex items-center gap-3 group" aria-label="APTICON 2026 Home">
              <div className="flex flex-col leading-none">
                <Image
                  src="/logo/APTICON_WORDMARK.png"
                  alt="APTICON 2026"
                  width={1536}
                  height={375}
                  priority
                  className="h-8 md:h-10 w-auto"
                />
                <span className="text-[10px] md:text-xs font-semibold tracking-[0.2em] text-[var(--muted-text)] uppercase mt-1">
                  2026 · Raipur
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Primary navigation">
              {PRIMARY_LINKS.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`
                      relative px-3 py-2 text-sm font-medium rounded-lg
                      transition-colors duration-200
                      ${active
                        ? "text-[var(--crimson-800)]"
                        : "text-[var(--dark-text)]/70 hover:text-[var(--crimson-800)]"
                      }
                    `}
                  >
                    {link.label}
                    {active && (
                      <motion.span
                        layoutId="nav-indicator"
                        className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-[var(--crimson-800)]"
                      />
                    )}
                  </Link>
                );
              })}

              {/* More dropdown for overflow links */}
              {SECONDARY_LINKS.length > 0 && (
                <div className="relative group">
                  <button className="px-3 py-2 text-sm font-medium text-[var(--dark-text)]/70 hover:text-[var(--crimson-800)] transition-colors rounded-lg">
                    More ▾
                  </button>
                  <div className="absolute top-full right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-[var(--gold-500)]/20 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    {SECONDARY_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block px-4 py-2.5 text-sm text-[var(--dark-text)] hover:bg-[var(--cream-100)] hover:text-[var(--crimson-800)] transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </nav>

            {/* CTA + hamburger */}
            <div className="flex items-center gap-3">
              <Link
                href="/registration"
                className="
                  hidden sm:inline-flex items-center px-5 py-2 rounded-full text-sm font-semibold
                  bg-[var(--crimson-800)] text-white
                  hover:bg-[var(--crimson-700)]
                  transition-colors duration-200
                  shadow-md shadow-[var(--crimson-800)]/20
                "
              >
                Register
              </Link>

              <button
                onClick={() => setMenuOpen(true)}
                aria-label="Open navigation menu"
                className="lg:hidden p-2 rounded-xl text-[var(--dark-text)] hover:bg-[var(--cream-200)] transition-colors"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <MobileMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        pathname={pathname}
      />
    </>
  );
}
