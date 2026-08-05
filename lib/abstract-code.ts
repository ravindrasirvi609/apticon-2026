import Counter from "@/models/Counter";
import { SUBJECT_CODES } from "@/lib/subject-codes";

export async function generateAbstractCode(presentationType: "oral" | "poster", theme: string): Promise<string> {
  const prefix = presentationType === "oral" ? "O" : "P";
  const subjectCode = SUBJECT_CODES[theme] ?? "XX";
  const key = `abstract-${presentationType}-${new Date().getFullYear()}`;
  const doc = await Counter.findOneAndUpdate({ _id: key }, { $inc: { seq: 1 } }, { upsert: true, new: true }).lean();
  return `${prefix}-${subjectCode}-${doc!.seq}`;
}
