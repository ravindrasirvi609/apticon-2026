import { NextResponse, type NextRequest } from "next/server";
import { requireRole, authErrorResponse } from "@/lib/auth";
import { csvResponse, excelResponse } from "@/lib/export";
import { getActionReport, REPORT_TYPE_MAP } from "@/lib/mobile/reports";
import { DAY_SCOPED_ACTION_TYPES } from "@/models/MobileActionLog";

const REPORT_LABELS: Record<string, string> = {
  "checked-in": "Checked In",
  "id-card": "ID Card",
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  kit: "Kit",
  certificate: "Certificate",
};

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ type: string }> },
) {
  try {
    await requireRole("super_admin");
    const { type } = await ctx.params;
    const actionType = REPORT_TYPE_MAP[type];
    if (!actionType)
      return NextResponse.json({ error: "Unknown report type" }, { status: 400 });

    const url = new URL(request.url);
    const format = url.searchParams.get("format");
    if (format !== "csv" && format !== "xlsx")
      return NextResponse.json({ error: "Choose csv or xlsx format" }, { status: 400 });

    const dayParam = url.searchParams.get("day");
    const day = dayParam ? Number(dayParam) : undefined;
    const dayScoped = DAY_SCOPED_ACTION_TYPES.includes(actionType);
    if (dayScoped && (!Number.isInteger(day) || (day ?? 0) < 1))
      return NextResponse.json({ error: "A valid day is required" }, { status: 400 });

    const firstPage = await getActionReport(actionType, { day, page: 1, limit: 100 });
    const pageCount = Math.ceil(firstPage.total / firstPage.limit);
    const remainingPages = [];
    for (let startPage = 2; startPage <= pageCount; startPage += 5) {
      const batchSize = Math.min(5, pageCount - startPage + 1);
      const batch = await Promise.all(
        Array.from({ length: batchSize }, (_, index) =>
          getActionReport(actionType, { day, page: startPage + index, limit: 100 }),
        ),
      );
      remainingPages.push(...batch);
    }
    const items = [firstPage, ...remainingPages].flatMap((result) => result.items);

    const headers = [
      "Activity",
      "Registration Code",
      "Delegate Name",
      "Email",
      "Phone",
      "Institution",
      ...(dayScoped ? ["Day"] : []),
      "Recorded At (UTC)",
      "Recorded By",
      "Device",
    ];
    const rows = items.map((item) => {
      const registration = item.registration;
      return [
        REPORT_LABELS[type],
        registration?.registrationCode ?? "",
        registration?.fullName ?? "Registration record unavailable",
        registration?.email ?? "",
        registration?.phone ?? "",
        registration?.institution ?? "",
        ...(dayScoped ? [item.day] : []),
        new Date(item.at).toISOString(),
        item.by,
        item.device,
      ];
    });
    const daySuffix = dayScoped ? `-day-${day}` : "";
    const filename = `APTICON-2026-checkin-${type}${daySuffix}`;

    if (format === "csv") {
      // Prevent spreadsheet applications from interpreting delegate/staff text as formulas.
      const safeRows = rows.map((row) =>
        row.map((cell) =>
          typeof cell === "string" && /^[\s]*[=+@-]/.test(cell) ? `'${cell}` : cell,
        ),
      );
      return csvResponse(`${filename}.csv`, headers, safeRows);
    }
    return excelResponse(`${filename}.xlsx`, "Check-in", headers, rows);
  } catch (err) {
    return authErrorResponse(err);
  }
}
