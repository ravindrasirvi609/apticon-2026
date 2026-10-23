"use client";
import { useRef } from "react";
import { Bold, Link2, List } from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import { Textarea } from "@/components/ui/shadcn/textarea";
import {
  EMAIL_VARIABLES,
  findUnknownVariables,
} from "@/lib/email-campaign-shared";
import type { EmailBodyFormat, FocusField } from "./types";

export interface MessageValue {
  subject: string;
  headline: string;
  replyTo: string;
  body: string;
  bodyFormat: EmailBodyFormat;
}

interface Props {
  value: MessageValue;
  onChange: (next: MessageValue) => void;
  disabled?: boolean;
}

export default function MessageEditor({ value, onChange, disabled }: Props) {
  const subjectRef = useRef<HTMLInputElement>(null);
  const headlineRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  // Variable chips insert into whichever field the admin touched last.
  const focused = useRef<FocusField>("body");

  const unknown = findUnknownVariables(
    value.subject,
    value.headline,
    value.body,
  );

  /** Replace the current selection of a field and put the caret after the inserted text. */
  function edit(
    field: FocusField,
    transform: (selected: string) => { text: string; select?: [number, number] },
  ) {
    const el = {
      subject: subjectRef.current,
      headline: headlineRef.current,
      body: bodyRef.current,
    }[field];
    if (!el) return;
    const current = value[field];
    const start = el.selectionStart ?? current.length;
    const end = el.selectionEnd ?? current.length;
    const { text, select } = transform(current.slice(start, end));
    onChange({
      ...value,
      [field]: current.slice(0, start) + text + current.slice(end),
    });
    requestAnimationFrame(() => {
      el.focus();
      const [a, b] = select
        ? [start + select[0], start + select[1]]
        : [start + text.length, start + text.length];
      el.setSelectionRange(a, b);
    });
  }

  function insertVariable(key: string) {
    edit(focused.current, () => ({ text: `{{${key}}}` }));
  }

  const isHtml = value.bodyFormat === "html";

  function wrap(open: string, close: string, placeholder: string) {
    edit("body", (sel) => {
      const inner = sel || placeholder;
      return {
        text: open + inner + close,
        select: [open.length, open.length + inner.length],
      };
    });
  }

  function insertLink() {
    edit("body", (sel) => {
      const label = sel || "link text";
      const url = "https://";
      const text = isHtml
        ? `<a href="${url}">${label}</a>`
        : `[${label}](${url})`;
      const urlStart = text.indexOf(url);
      return { text, select: [urlStart, urlStart + url.length] };
    });
  }

  function insertList() {
    edit("body", (sel) => {
      const text = isHtml
        ? `<ul>\n  <li>${sel || "First item"}</li>\n  <li>Second item</li>\n</ul>`
        : (sel
            ? sel
                .split("\n")
                .map((l) => (l.trim() ? `- ${l}` : l))
                .join("\n")
            : "- First item\n- Second item");
      return { text };
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label htmlFor="em-subject" className="text-xs font-medium">
            Subject *
          </Label>
          <Input
            id="em-subject"
            ref={subjectRef}
            value={value.subject}
            maxLength={200}
            disabled={disabled}
            placeholder="e.g. Important update for {{first_name|Delegate}} — APTICON 2026"
            onFocus={() => (focused.current = "subject")}
            onChange={(e) => onChange({ ...value, subject: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="em-headline" className="text-xs font-medium">
            Header title{" "}
            <span className="text-[var(--muted-text)] font-normal">
              (optional — defaults to the subject)
            </span>
          </Label>
          <Input
            id="em-headline"
            ref={headlineRef}
            value={value.headline}
            maxLength={120}
            disabled={disabled}
            onFocus={() => (focused.current = "headline")}
            onChange={(e) => onChange({ ...value, headline: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="em-replyto" className="text-xs font-medium">
            Reply-to address{" "}
            <span className="text-[var(--muted-text)] font-normal">
              (optional)
            </span>
          </Label>
          <Input
            id="em-replyto"
            type="email"
            value={value.replyTo}
            disabled={disabled}
            placeholder="secretariat@example.org"
            onChange={(e) => onChange({ ...value, replyTo: e.target.value })}
          />
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
          <Label htmlFor="em-body" className="text-xs font-medium">
            Message *
          </Label>
          <div className="flex items-center gap-1">
            <div className="inline-flex rounded-lg bg-[var(--surface-100)] p-0.5 mr-2">
              {(["text", "html"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange({ ...value, bodyFormat: f })}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    value.bodyFormat === f
                      ? "bg-white text-[var(--primary-800)] shadow-sm"
                      : "text-[var(--muted-text)]"
                  }`}
                >
                  {f === "text" ? "Simple text" : "HTML"}
                </button>
              ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="Bold"
              disabled={disabled}
              onClick={() =>
                isHtml ? wrap("<b>", "</b>", "bold text") : wrap("**", "**", "bold text")
              }
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="Link"
              disabled={disabled}
              onClick={insertLink}
            >
              <Link2 className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="Bullet list"
              disabled={disabled}
              onClick={insertList}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <Textarea
          id="em-body"
          ref={bodyRef}
          rows={12}
          value={value.body}
          disabled={disabled}
          className="font-mono text-[13px] leading-relaxed"
          onFocus={() => (focused.current = "body")}
          onChange={(e) => onChange({ ...value, body: e.target.value })}
        />
        <p className="mt-1.5 text-xs text-[var(--muted-text)]">
          {isHtml
            ? "HTML mode: write the message as HTML. Variable values are escaped automatically."
            : "Blank line = new paragraph · **bold** · [text](https://link) · lines starting with “- ” become a bullet list. Web addresses are linked automatically."}
        </p>
        {unknown.length > 0 && (
          <p className="mt-1.5 text-xs font-semibold text-red-700">
            Unknown variable{unknown.length > 1 ? "s" : ""}:{" "}
            {unknown.map((k) => `{{${k}}}`).join(", ")} — pick from the list below.
          </p>
        )}
      </div>

      <div>
        <div className="text-xs font-medium mb-1.5">
          Insert variable{" "}
          <span className="text-[var(--muted-text)] font-normal">
            — filled in per delegate. Add a fallback with{" "}
            <code className="font-mono">{"{{name|Delegate}}"}</code>.
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {EMAIL_VARIABLES.map((v) => (
            <button
              key={v.key}
              type="button"
              disabled={disabled}
              title={`${v.label} — e.g. ${v.sample}`}
              // Keep the caret in the field: a mousedown on the chip would blur it first.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => insertVariable(v.key)}
              className="rounded-full border border-[var(--accent-500)]/30 bg-white px-2.5 py-1 text-xs font-mono text-[var(--primary-800)] hover:bg-[var(--surface-100)] hover:border-[var(--primary-800)]/40 transition-colors disabled:opacity-50"
            >
              {`{{${v.key}}}`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
