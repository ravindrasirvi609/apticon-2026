import { NextResponse, type NextRequest } from "next/server";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  PageNumber,
  Header,
  Footer,
  SectionType,
  PageOrientation,
  BorderStyle,
} from "docx";
import { connectDB } from "@/lib/db";
import Abstract from "@/models/Abstract";
import { getSessionFromCookies } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

// -----------------------------------------------------------------------------
// APTICON abstract-book Word export
//
// Matches the pixel-formatting from the APTICON 2024 print book:
//   • Times New Roman body, ~10pt
//   • Two-column body layout for the abstract text
//   • Each abstract begins with a centered code (e.g. "OCG151")
//   • Bold, uppercase, centered title
//   • Centered author list, then centered institution
//   • Bold "Abstract:" label above the body
//   • Body renders inline bold section labels: Objectives / Methods / Results /
//     Conclusions — matching how each paragraph runs together in the print book
//   • Running header: "APTICON 2026/ <VENUE>"  (right-aligned)
//   • Footer: page number centered inside a horizontal rule
// -----------------------------------------------------------------------------

// Twips helpers (docx uses twips: 1 inch = 1440, 1 pt = 20)
const pt = (n: number) => Math.round(n * 2); // half-points for run size
const inch = (n: number) => Math.round(n * 1440);

const FONT = "Times New Roman";

// Split the abstract body into runs, bolding the well-known section labels so
// they render inline (e.g.  **Objectives:** The current study …).
function bodyRuns(text: string): TextRun[] {
  const cleaned = (text || "").replace(/\r\n/g, "\n").trim();
  if (!cleaned) return [new TextRun({ text: "", font: FONT, size: pt(10) })];

  // Labels the print book bolds inline
  const LABELS = [
    "Objectives",
    "Objective",
    "Aim",
    "Aims",
    "Background",
    "Introduction",
    "Methods",
    "Methodology",
    "Materials and Methods",
    "Results",
    "Discussion",
    "Conclusions",
    "Conclusion",
  ];
  // Longest first so "Materials and Methods" wins over "Methods"
  const escaped = LABELS.map((l) => l.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).sort((a, b) => b.length - a.length);
  const rx = new RegExp(`(^|[\\s.;])(${escaped.join("|")})\\s*:\\s*`, "g");

  const runs: TextRun[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = rx.exec(cleaned)) !== null) {
    const preLen = m[1]?.length ?? 0;
    const labelStart = m.index + preLen;
    // Push everything before the label
    if (labelStart > last) {
      runs.push(new TextRun({ text: cleaned.slice(last, labelStart), font: FONT, size: pt(10) }));
    }
    // Bold label with trailing colon + space
    runs.push(new TextRun({ text: `${m[2]}:`, font: FONT, size: pt(10), bold: true }));
    runs.push(new TextRun({ text: " ", font: FONT, size: pt(10) }));
    last = rx.lastIndex;
  }
  if (last < cleaned.length) {
    runs.push(new TextRun({ text: cleaned.slice(last), font: FONT, size: pt(10) }));
  }
  return runs;
}

interface AbstractDoc {
  submissionCode: string;
  title: string;
  authors: string;
  presentingAuthor: string;
  institution: string;
  abstract: string;
  theme?: string;
  type?: string;
}

// Format the author line so the presenting author gets an asterisk suffix, as
// in the print book. `authors` is stored as a free-text string, but if the
// presenting author's name is embedded we ensure the * is placed on it.
function formatAuthorLine(a: AbstractDoc): string {
  const authors = (a.authors || "").trim();
  const presenter = (a.presentingAuthor || "").trim();
  if (!authors) return presenter ? `${presenter}*` : "";
  if (!presenter) return authors;
  // If presenter appears in authors and doesn't already end with *, add one.
  if (authors.includes(presenter)) {
    if (authors.includes(`${presenter}*`)) return authors;
    return authors.replace(presenter, `${presenter}*`);
  }
  // Otherwise prepend presenter with * followed by co-authors
  return `${presenter}*, ${authors}`;
}

function buildAbstractSection(a: AbstractDoc, index: number): Paragraph[] {
  const paras: Paragraph[] = [];

  // Code — bold, centered
  paras.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: index === 0 ? 0 : pt(6), after: pt(2) },
      children: [
        new TextRun({
          text: a.submissionCode || "",
          font: FONT,
          size: pt(11),
          bold: true,
        }),
      ],
    })
  );

  // Title — bold, uppercase, centered
  paras.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: pt(2) },
      children: [
        new TextRun({
          text: (a.title || "").toUpperCase(),
          font: FONT,
          size: pt(11),
          bold: true,
        }),
      ],
    })
  );

  // Authors — centered
  paras.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: pt(1) },
      children: [
        new TextRun({
          text: formatAuthorLine(a),
          font: FONT,
          size: pt(10),
        }),
      ],
    })
  );

  // Institution — centered
  if (a.institution) {
    paras.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: pt(4) },
        children: [
          new TextRun({
            text: a.institution,
            font: FONT,
            size: pt(10),
          }),
        ],
      })
    );
  }

  // "Abstract:" label — bold, left-aligned, above two-column body
  paras.push(
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: pt(1) },
      children: [
        new TextRun({
          text: "Abstract:",
          font: FONT,
          size: pt(10),
          bold: true,
        }),
      ],
    })
  );

  // Body — justified, with bolded inline section labels
  paras.push(
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: pt(6), line: 240 },
      children: bodyRuns(a.abstract || ""),
    })
  );

  return paras;
}

async function loadAbstracts(): Promise<AbstractDoc[]> {
  await connectDB();
  const items = await Abstract.find({})
    .sort({ submissionCode: 1, createdAt: 1 })
    .select("submissionCode title authors presentingAuthor institution abstract theme type")
    .lean();
  return items.map((d) => ({
    submissionCode: d.submissionCode,
    title: d.title,
    authors: d.authors,
    presentingAuthor: d.presentingAuthor,
    institution: d.institution,
    abstract: d.abstract,
    theme: d.theme,
    type: d.type,
  }));
}

function makeHeader(): Header {
  return new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({
            text: "APTICON 2026/ BBSR",
            font: FONT,
            size: pt(10),
            bold: false,
          }),
        ],
      }),
    ],
  });
}

function makeFooter(): Footer {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        border: {
          top: { style: BorderStyle.SINGLE, size: 8, color: "000000", space: 4 },
        },
        children: [
          new TextRun({ text: "", font: FONT, size: pt(10) }),
          new TextRun({
            children: [PageNumber.CURRENT],
            font: FONT,
            size: pt(10),
          }),
        ],
      }),
    ],
  });
}

// GET /api/abstracts/export-word — super admin only
export async function GET(request: NextRequest) {
  const s = await getSessionFromCookies();
  if (!s || s.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const abstracts = await loadAbstracts();

  // Build one big paragraph list; docx will flow it across pages/columns.
  const bodyParas: Paragraph[] = [];
  abstracts.forEach((a, i) => {
    bodyParas.push(...buildAbstractSection(a, i));
  });

  if (bodyParas.length === 0) {
    bodyParas.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: "No abstracts have been submitted yet.",
            font: FONT,
            size: pt(11),
            italics: true,
          }),
        ],
      })
    );
  }

  const doc = new Document({
    creator: "APTICON 2026 Admin Console",
    title: "APTICON 2026 — Abstract Book",
    description: "Compiled abstracts for APTICON 2026",
    styles: {
      default: {
        document: {
          run: { font: FONT, size: pt(10) },
        },
      },
    },
    sections: [
      {
        properties: {
          type: SectionType.NEXT_PAGE,
          page: {
            size: {
              orientation: PageOrientation.PORTRAIT,
              width: inch(8.5),
              height: inch(11),
            },
            margin: {
              top: inch(0.9),
              right: inch(0.75),
              bottom: inch(0.9),
              left: inch(0.75),
              header: inch(0.4),
              footer: inch(0.4),
            },
          },
          column: {
            count: 2,
            space: inch(0.3),
            equalWidth: true,
          },
        },
        headers: { default: makeHeader() },
        footers: { default: makeFooter() },
        children: bodyParas,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);

  await logAudit({
    actorRole: s.role,
    actor: s.uid,
    action: "abstract.export.word",
    resourceType: "abstract",
    details: { count: abstracts.length },
    request,
  });

  const filename = `APTICON-2026-Abstracts-${new Date().toISOString().slice(0, 10)}.docx`;

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
      "Content-Length": String(buffer.length),
    },
  });
}
