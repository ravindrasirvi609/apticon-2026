import type { Metadata } from "next";
import GroupRegistrationClient from "./GroupRegistrationClient";

export const metadata: Metadata = {
  title: "Group Registration | APTICON 2026",
  description:
    "Register a group of 10 or more paid delegates for APTICON 2026 together and add 1 complimentary seat for every 10 paid delegates.",
};

export default function GroupRegistrationPage() {
  return <GroupRegistrationClient />;
}
