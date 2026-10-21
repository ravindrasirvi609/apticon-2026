"use client";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { Badge } from "@/components/ui/shadcn/badge";
import { Button } from "@/components/ui/shadcn/button";
import { Checkbox } from "@/components/ui/shadcn/checkbox";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import { Textarea } from "@/components/ui/shadcn/textarea";
import { EMAIL_MAX_RECIPIENTS } from "@/lib/email-campaign-shared";
import type { DelegateRow } from "./types";

const FILTERS = [
  { key: "all", label: "All delegates" },
  { key: "approved", label: "Payment approved" },
  { key: "registered_only", label: "Registered · no abstract" },
  { key: "both", label: "Registered + abstract" },
  { key: "abstract_only", label: "Abstract · not registered" },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

/** Rows rendered at once; "select all" still covers every match, not just the visible rows. */
const RENDER_LIMIT = 300;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Split pasted text on commas, semicolons, spaces and newlines. */
export function parseEmailList(text: string): {
  valid: string[];
  invalid: string[];
} {
  const valid = new Set<string>();
  const invalid: string[] = [];
  for (const token of text.split(/[\s,;]+/)) {
    const email = token.trim().toLowerCase();
    if (!email) continue;
    if (EMAIL_RE.test(email)) valid.add(email);
    else invalid.push(token.trim());
  }
  return { valid: [...valid], invalid };
}

interface Props {
  selected: Set<string>;
  onSelectedChange: (next: Set<string>) => void;
  extraText: string;
  onExtraTextChange: (next: string) => void;
  disabled?: boolean;
}

export default function RecipientPicker({
  selected,
  onSelectedChange,
  extraText,
  onExtraTextChange,
  disabled,
}: Props) {
  const [rows, setRows] = useState<DelegateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setLoadError("");
      const params = new URLSearchParams({ filter });
      if (debouncedQ) params.set("q", debouncedQ);
      try {
        const res = await fetch(`/api/admin/delegates?${params.toString()}`);
        if (!res.ok) throw new Error("Could not load delegates");
        const data = await res.json();
        if (!cancelled) setRows(data.rows ?? []);
      } catch (e) {
        if (!cancelled)
          setLoadError(e instanceof Error ? e.message : "Could not load delegates");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [filter, debouncedQ]);

  const extras = useMemo(() => parseEmailList(extraText), [extraText]);

  const total = useMemo(() => {
    const all = new Set(selected);
    extras.valid.forEach((e) => all.add(e));
    return all.size;
  }, [selected, extras]);

  const shownSelected = rows.filter((r) => selected.has(r.email)).length;
  const allShownChecked = rows.length > 0 && shownSelected === rows.length;

  function toggleShown() {
    const next = new Set(selected);
    if (allShownChecked) rows.forEach((r) => next.delete(r.email));
    else rows.forEach((r) => next.add(r.email));
    onSelectedChange(next);
  }

  function toggleOne(email: string) {
    const next = new Set(selected);
    if (next.has(email)) next.delete(email);
    else next.add(email);
    onSelectedChange(next);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />
          <Input
            placeholder="Search name, email, code, institution…"
            className="pl-9"
            value={q}
            disabled={disabled}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <Button
              key={f.key}
              type="button"
              size="sm"
              variant={filter === f.key ? "default" : "outline"}
              disabled={disabled}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[var(--surface-100)] px-3 py-2">
        <div className="text-sm">
          <span className="font-semibold">{rows.length}</span> shown ·{" "}
          <span className="font-semibold">{shownSelected}</span> of them selected
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled || loading || rows.length === 0}
            onClick={toggleShown}
          >
            {allShownChecked
              ? `Deselect these ${rows.length}`
              : `Select all ${rows.length} shown`}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={disabled || selected.size === 0}
            onClick={() => onSelectedChange(new Set())}
          >
            Clear selection
          </Button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto rounded-lg border border-[var(--accent-500)]/25">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-[var(--muted-text)]">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading delegates…
          </div>
        ) : loadError ? (
          <div className="py-10 text-center text-sm text-red-700">{loadError}</div>
        ) : rows.length === 0 ? (
          <div className="py-10 text-center text-sm text-[var(--muted-text)]">
            No delegates match.
          </div>
        ) : (
          <ul className="divide-y divide-[var(--surface-200)]">
            {rows.slice(0, RENDER_LIMIT).map((r) => (
              <li key={r.email}>
                <label className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-[var(--surface-50)]">
                  <Checkbox
                    checked={selected.has(r.email)}
                    disabled={disabled}
                    onCheckedChange={() => toggleOne(r.email)}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{r.name}</div>
                    <div className="truncate text-xs text-[var(--muted-text)]">
                      {r.email}
                      {r.institution ? ` · ${r.institution}` : ""}
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                    {r.registration ? (
                      <Badge
                        variant={
                          r.registration.status === "approved" ? "success" : "warning"
                        }
                      >
                        {r.registration.status === "approved" ? "Paid" : "Unpaid"}
                      </Badge>
                    ) : (
                      <Badge variant="danger">Not registered</Badge>
                    )}
                    {r.abstracts.length > 0 && (
                      <Badge variant="info">
                        {r.abstracts.length} abstract
                        {r.abstracts.length > 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                </label>
              </li>
            ))}
            {rows.length > RENDER_LIMIT && (
              <li className="px-3 py-2 text-center text-xs text-[var(--muted-text)]">
                Showing the first {RENDER_LIMIT} of {rows.length}. Narrow the search,
                or use “Select all {rows.length} shown” to include every match.
              </li>
            )}
          </ul>
        )}
      </div>

      <div>
        <Label htmlFor="em-extra" className="text-xs font-medium">
          Additional email addresses{" "}
          <span className="text-[var(--muted-text)] font-normal">
            (optional — paste several, separated by commas, spaces or new lines)
          </span>
        </Label>
        <Textarea
          id="em-extra"
          rows={3}
          value={extraText}
          disabled={disabled}
          placeholder="guest@example.com, speaker@example.org"
          onChange={(e) => onExtraTextChange(e.target.value)}
        />
        {extras.invalid.length > 0 && (
          <p className="mt-1 text-xs font-semibold text-red-700">
            Not valid email addresses (ignored): {extras.invalid.slice(0, 5).join(", ")}
            {extras.invalid.length > 5 ? ` and ${extras.invalid.length - 5} more` : ""}
          </p>
        )}
      </div>

      <div
        className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
          total > EMAIL_MAX_RECIPIENTS
            ? "border-red-300 bg-red-50 text-red-800"
            : "border-[var(--accent-500)]/25 bg-[var(--surface-50)]"
        }`}
      >
        {total} recipient{total === 1 ? "" : "s"} will receive this email
        {total > EMAIL_MAX_RECIPIENTS &&
          ` — the limit is ${EMAIL_MAX_RECIPIENTS} per campaign`}
      </div>
    </div>
  );
}
