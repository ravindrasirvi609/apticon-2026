import type { Metadata } from "next";
import GroupRegistrationClient from "./GroupRegistrationClient";

export const metadata: Metadata = {
  title: "Group Registration | APTICON 2026",
  description:
    "Register a group of 15 or more paid delegates for APTICON 2026 together and get 2 complimentary seats for every 15 paid delegates.",
};

export default function GroupRegistrationPage() {
  return <GroupRegistrationClient />;
}
