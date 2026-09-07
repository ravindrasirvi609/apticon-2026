import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Registration from "@/models/Registration";
import Abstract from "@/models/Abstract";
import { requireRole, authErrorResponse } from "@/lib/auth";

// Unified per-person view: aggregates by lowercased email across both
// Registration and Abstract collections.

interface DelegateRow {
  email: string;
  name: string;
  institution?: string;
  photoUrl?: string;
  registration: {
    id: string;
    code: string;
    status: string;
    paymentStatus?: string;
    feeAmount: number;
    createdAt: string;
  } | null;
  abstracts: {
    id: string;
    submissionCode: string;
    title: string;
    status: string;
    createdAt: string;
  }[];
}

export async function GET(request: NextRequest) {
  try {
    await requireRole("super_admin");
    await connectDB();

    const url = new URL(request.url);
    const filter = url.searchParams.get("filter") ?? "all"; // all | registered_only | abstract_only | both | approved
    const q = (url.searchParams.get("q") ?? "").trim();

    const [regs, absts] = await Promise.all([
      Registration.find({}).sort({ createdAt: -1 }).lean(),
      Abstract.find({}).sort({ createdAt: -1 }).lean(),
    ]);

    const rows: Map<string, DelegateRow> = new Map();

    for (const r of regs) {
      const key = r.email.toLowerCase();
      const row: DelegateRow = rows.get(key) ?? {
        email: key,
        name: r.fullName,
        institution: r.institution,
        registration: null,
        abstracts: [],
      };
      row.name ||= r.fullName;
      row.institution ||= r.institution;
      row.photoUrl ||= r.photoUrl || undefined;
      row.registration = {
        id: r._id.toString(),
        code: r.registrationCode,
        status: r.status,
        paymentStatus: r.paymentStatus,
        feeAmount: r.feeAmount,
        createdAt: r.createdAt.toISOString(),
      };
      rows.set(key, row);
    }

    for (const a of absts) {
      const key = a.email.toLowerCase();
      const row: DelegateRow = rows.get(key) ?? {
        email: key,
        name: a.presentingAuthor,
        institution: a.institution,
        registration: null,
        abstracts: [],
      };
      row.name ||= a.presentingAuthor;
      row.institution ||= a.institution;
      row.abstracts.push({
        id: a._id.toString(),
        submissionCode: a.submissionCode,
        title: a.title,
        status: a.status,
        createdAt: a.createdAt.toISOString(),
      });
      rows.set(key, row);
    }

    let out = Array.from(rows.values());

    if (filter === "registered_only")
      out = out.filter((r) => r.registration && r.abstracts.length === 0);
    else if (filter === "abstract_only")
      out = out.filter((r) => !r.registration && r.abstracts.length > 0);
    else if (filter === "both")
      out = out.filter((r) => r.registration && r.abstracts.length > 0);
    else if (filter === "approved")
      out = out.filter((r) => r.registration?.status === "approved");

    if (q) {
      const needle = q.toLowerCase();
      out = out.filter(
        (r) =>
          r.email.includes(needle) ||
          r.name.toLowerCase().includes(needle) ||
          (r.institution?.toLowerCase().includes(needle) ?? false) ||
          (r.registration?.code.toLowerCase().includes(needle) ?? false) ||
          r.abstracts.some(
            (a) =>
              a.submissionCode.toLowerCase().includes(needle) ||
              a.title.toLowerCase().includes(needle),
          ),
      );
    }

    // Sort: registered+abstract first, then registered-only, then abstract-only
    out.sort((a, b) => {
      const rank = (row: DelegateRow) =>
        row.registration && row.abstracts.length > 0
          ? 0
          : row.registration
            ? 1
            : 2;
      return rank(a) - rank(b) || a.name.localeCompare(b.name);
    });

    return NextResponse.json({ total: out.length, rows: out });
  } catch (err) {
    return authErrorResponse(err);
  }
}
