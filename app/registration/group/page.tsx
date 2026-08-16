import type { Metadata } from "next";
import GroupRegistrationClient from "./GroupRegistrationClient";

export const metadata: Metadata = {
  title: "Group Registration | APTICON 2026",
  description: "Register a group of 10 or more delegates for APTICON 2026 together and get 1 complimentary seat for every 10 delegates.",
};

export default function GroupRegistrationPage() {
  return <GroupRegistrationClient />;
}
