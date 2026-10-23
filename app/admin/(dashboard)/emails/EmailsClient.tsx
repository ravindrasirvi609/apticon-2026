"use client";
import { useMemo, useState } from "react";
import { AlertTriangle, History, Loader2, Mail, Send, SquarePen, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/console/PageHeader";
import AttachmentsField from "@/components/console/emails/AttachmentsField";
import CampaignHistory from "@/components/console/emails/CampaignHistory";
import EmailPreview from "@/components/console/emails/EmailPreview";
import MessageEditor, {
  type MessageValue,
} from "@/components/console/emails/MessageEditor";
import RecipientPicker, {
  parseEmailList,
} from "@/components/console/emails/RecipientPicker";
import SendProgressDialog, {
  type FirstAction,
} from "@/components/console/emails/SendProgressDialog";
import type { CampaignAttachment } from "@/components/console/emails/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/shadcn/alert-dialog";
import { Button } from "@/components/ui/shadcn/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/shadcn/tabs";
import {
  DEFAULT_EMAIL_BODY,
  EMAIL_MAX_RECIPIENTS,
  findUnknownVariables,
} from "@/lib/email-campaign-shared";

interface Props {
  configured: boolean;
  sandboxSender: boolean;
  adminEmail: string;
}

interface ActiveRun {
  id: string;
  subject: string;
  firstAction: FirstAction;
}

export default function EmailsClient({
  configured,
  sandboxSender,
  adminEmail,
}: Props) {
  const [tab, setTab] = useState<"compose" | "history">("compose");
  const [message, setMessage] = useState<MessageValue>({
    subject: "",
    headline: "",
    replyTo: "",
    body: DEFAULT_EMAIL_BODY,
    bodyFormat: "text",
  });
  const [attachments, setAttachments] = useState<CampaignAttachment[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [extraText, setExtraText] = useState("");
  const [testTo, setTestTo] = useState(adminEmail);
  const [testing, setTesting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [run, setRun] = useState<ActiveRun | null>(null);
  const [historyKey, setHistoryKey] = useState(0);
  const [approvedEmailConfirmOpen, setApprovedEmailConfirmOpen] = useState(false);
  const [sendingApprovedEmails, setSendingApprovedEmails] = useState(false);

  const recipients = useMemo(() => {
    const all = new Set(selected);
    parseEmailList(extraText).valid.forEach((e) => all.add(e));
    return [...all];
  }, [selected, extraText]);

  const unknownVars = findUnknownVariables(
    message.subject,
    message.headline,
    message.body,
  );
  const blocker = !configured
    ? "Email sending is not configured on the server."
    : !message.subject.trim()
      ? "Add a subject."
      : !message.body.trim()
        ? "Write the message."
        : unknownVars.length > 0
          ? "Fix the unknown variables in your message."
          : recipients.length === 0
            ? "Choose at least one recipient."
            : recipients.length > EMAIL_MAX_RECIPIENTS
              ? `A campaign can have at most ${EMAIL_MAX_RECIPIENTS} recipients.`
              : "";

  function payload() {
    return {
      subject: message.subject,
      headline: message.headline,
      body: message.body,
      bodyFormat: message.bodyFormat,
      replyTo: message.replyTo,
      attachments,
    };
  }

  async function sendTest() {
    if (!message.subject.trim() || !message.body.trim()) {
      toast.error("Add a subject and a message first.");
      return;
    }
    setTesting(true);
    try {
      const res = await fetch("/api/admin/emails/test", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...payload(), to: testTo }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Test email failed");
      toast.success(`Test email sent to ${testTo}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Test email failed");
    } finally {
      setTesting(false);
    }
  }

  async function startCampaign() {
    setConfirmOpen(false);
    setCreating(true);
    try {
      const res = await fetch("/api/admin/emails/campaigns", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...payload(), emails: recipients }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not start the campaign");
      setRun({ id: data.id, subject: message.subject, firstAction: "send" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start the campaign");
    } finally {
      setCreating(false);
    }
  }

  function closeRun() {
    setRun(null);
    setHistoryKey((k) => k + 1);
    setTab("history");
  }

  async function sendApprovedRegistrationEmails() {
    setApprovedEmailConfirmOpen(false);
    setSendingApprovedEmails(true);
    try {
      const res = await fetch("/api/admin/emails/approved-registrations", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not send confirmation emails");
      toast.success(
        data.sent === 0
          ? "No unsent approved registration emails found."
          : `Sent ${data.sent} confirmation email${data.sent === 1 ? "" : "s"}${data.failed ? `; ${data.failed} failed` : ""}.`,
      );
      if (data.failed) toast.error(data.failures?.map((f: { email: string }) => f.email).join(", "));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send confirmation emails");
    } finally {
      setSendingApprovedEmails(false);
    }
  }

  return (
    <div className="p-4 md:p-8">
      <PageHeader
        title="Bulk Email"
        description="Write a message, attach files, choose delegates, and send it through Resend."
      />

      <Card className="mb-6 border-[var(--accent-500)]/25">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 font-semibold"><BadgeCheck className="h-4 w-4 text-[var(--accent-600)]" /> Approved registration confirmations</div>
            <p className="mt-1 text-xs text-[var(--muted-text)]">Send the existing confirmation template and each person&apos;s unique QR code. Already sent confirmations are skipped.</p>
          </div>
          <Button variant="outline" onClick={() => setApprovedEmailConfirmOpen(true)} disabled={!configured || sendingApprovedEmails}>
            {sendingApprovedEmails ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            Send to all approved
          </Button>
        </CardContent>
      </Card>

      {!configured && (
        <Banner tone="red" title="Email is not configured">
          <code className="font-mono">RESEND_API_KEY</code> is missing, so nothing can be sent.
          Add it to the server environment and redeploy.
        </Banner>
      )}
      {configured && sandboxSender && (
        <Banner tone="amber" title="Resend sandbox sender in use">
          <code className="font-mono">RESEND_FROM</code> is not set, so mail goes out from{" "}
          <code className="font-mono">onboarding@resend.dev</code> — Resend only delivers that
          sender&apos;s mail to your own account address. Set{" "}
          <code className="font-mono">RESEND_FROM</code> to an address on a domain you have
          verified in Resend before emailing delegates.
        </Banner>
      )}

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="mb-6">
          <TabsTrigger value="compose">
            <SquarePen className="w-4 h-4 mr-1.5" /> Compose
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="w-4 h-4 mr-1.5" /> History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">1. Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <MessageEditor
                value={message}
                onChange={setMessage}
                disabled={creating}
              />
              <div>
                <Label className="text-xs font-medium mb-1.5 block">Attachments</Label>
                <AttachmentsField
                  value={attachments}
                  onChange={setAttachments}
                  disabled={creating}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">2. Recipients</CardTitle>
            </CardHeader>
            <CardContent>
              <RecipientPicker
                selected={selected}
                onSelectedChange={setSelected}
                extraText={extraText}
                onExtraTextChange={setExtraText}
                disabled={creating}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">3. Preview &amp; send</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <EmailPreview
                message={message}
                recipientOptions={recipients.slice(0, 25)}
              />

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-lg border border-[var(--accent-500)]/25 p-4">
                  <Label htmlFor="em-test" className="text-xs font-medium">
                    Send a test first
                  </Label>
                  <p className="text-xs text-[var(--muted-text)] mb-2">
                    Delivers this message, with its attachments and sample data, to one address.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      id="em-test"
                      type="email"
                      value={testTo}
                      onChange={(e) => setTestTo(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={sendTest}
                      disabled={testing || !configured || !testTo}
                    >
                      {testing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Mail className="w-4 h-4" />
                      )}
                      Send test
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg border border-[var(--accent-500)]/25 bg-[var(--surface-50)] p-4 flex flex-col justify-between gap-3">
                  <div className="text-sm">
                    <div className="font-semibold">
                      {recipients.length} recipient{recipients.length === 1 ? "" : "s"}
                      {attachments.length > 0 &&
                        ` · ${attachments.length} attachment${attachments.length === 1 ? "" : "s"}`}
                    </div>
                    {blocker && (
                      <div className="text-xs text-[var(--muted-text)] mt-0.5">
                        {blocker}
                      </div>
                    )}
                  </div>
                  <Button
                    size="lg"
                    variant="gold"
                    disabled={Boolean(blocker) || creating}
                    onClick={() => setConfirmOpen(true)}
                  >
                    {creating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Send to {recipients.length} recipient{recipients.length === 1 ? "" : "s"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <CampaignHistory
            refreshKey={historyKey}
            onRun={(c, firstAction) =>
              setRun({ id: c.id, subject: c.subject, firstAction })
            }
          />
        </TabsContent>
      </Tabs>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Send to {recipients.length} recipient{recipients.length === 1 ? "" : "s"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              “{message.subject}” will be emailed
              {attachments.length > 0
                ? ` with ${attachments.length} attachment${attachments.length === 1 ? "" : "s"}`
                : ""}
              . Sent emails cannot be recalled. You can pause or cancel while it runs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go back</AlertDialogCancel>
            <AlertDialogAction onClick={startCampaign}>Send now</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={approvedEmailConfirmOpen} onOpenChange={setApprovedEmailConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send approved registration confirmations?</AlertDialogTitle>
            <AlertDialogDescription>
              Every approved registration without a recorded confirmation email will receive the standard success email with its own QR code. Already sent confirmations will be skipped.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={sendApprovedRegistrationEmails}>Send now</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {run && (
        <SendProgressDialog
          key={`${run.id}-${run.firstAction}`}
          campaignId={run.id}
          subject={run.subject}
          firstAction={run.firstAction}
          onClose={closeRun}
        />
      )}
    </div>
  );
}

function Banner({
  tone,
  title,
  children,
}: {
  tone: "red" | "amber";
  title: string;
  children: React.ReactNode;
}) {
  const styles =
    tone === "red"
      ? "border-red-300 bg-red-50 text-red-900"
      : "border-amber-300 bg-amber-50 text-amber-900";
  return (
    <div className={`mb-6 flex gap-3 rounded-lg border p-4 text-sm ${styles}`}>
      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
      <div>
        <div className="font-semibold">{title}</div>
        {children}
      </div>
    </div>
  );
}
