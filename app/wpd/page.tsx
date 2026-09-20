import type { Metadata } from "next";
import WpdClient from "./WpdClient";

export const metadata: Metadata = {
  title: "World Pharmacists Day Post Generator",
  description: "Create your personalised World Pharmacists Day 2026 social media post.",
};

export default function WpdPage() {
  return <WpdClient />;
}
