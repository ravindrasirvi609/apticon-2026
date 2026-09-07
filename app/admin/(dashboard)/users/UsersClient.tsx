"use client";
import { useEffect, useState } from "react";
import { UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import PageHeader from "@/components/console/PageHeader";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/shadcn/table";
import { Button } from "@/components/ui/shadcn/button";
import { Badge } from "@/components/ui/shadcn/badge";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/shadcn/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/shadcn/alert-dialog";

type UserRole = "super_admin" | "reviewer" | "editorial" | "checkin_staff";

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  expertise: string[];
  isActive: boolean;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

const ROLE_LABEL: Record<UserRole, string> = {
  super_admin: "Super Admin",
  reviewer: "Reviewer",
  editorial: "Editorial",
  checkin_staff: "Check-in Staff",
};

export default function UsersClient() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    email: "",
    name: "",
    role: "reviewer" as UserRole,
    expertise: "",
  });

  async function load() {
    setLoading(true);
    const res = await fetch("/api/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function createUser() {
    setSaving(true);
    try {
      const expertise = form.expertise
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, expertise }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      toast.success(`User created. Credentials sent to ${form.email}.`);
      setOpen(false);
      setForm({ email: "", name: "", role: "reviewer", expertise: "" });
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create user");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(u: UserRow) {
    const res = await fetch(`/api/users/${u.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ isActive: !u.isActive }),
    });
    if (res.ok) {
      toast.success(u.isActive ? "User deactivated" : "User reactivated");
      await load();
    } else {
      const b = await res.json();
      toast.error(b.error ?? "Failed");
    }
  }

  return (
    <div className="p-4 md:p-8">
      <PageHeader
        title="Users"
        description="Manage super admins, reviewers, editorial, and check-in staff accounts."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4" />
                New user
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create user</DialogTitle>
                <DialogDescription>
                  A temporary password will be emailed to the address you
                  provide.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    className="mt-2"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    className="mt-2"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Role</Label>
                  <div className="mt-2 grid grid-cols-1 gap-2">
                    {(
                      [
                        "reviewer",
                        "editorial",
                        "super_admin",
                        "checkin_staff",
                      ] as UserRole[]
                    ).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setForm({ ...form, role: r })}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium text-left ${
                          form.role === r
                            ? "bg-[var(--primary-800)] text-white border-[var(--primary-800)]"
                            : "bg-white border-[var(--accent-500)]/30"
                        }`}
                      >
                        {ROLE_LABEL[r]}
                        <div
                          className={`text-xs mt-0.5 ${form.role === r ? "opacity-90" : "text-[var(--muted-text)]"}`}
                        >
                          {r === "reviewer"
                            ? "Reviews assigned abstracts and submits scores"
                            : r === "editorial"
                              ? "Assigns abstracts to reviewers and records final decisions"
                              : r === "checkin_staff"
                                ? "Uses the mobile app to check in attendees and record meal/kit/certificate distribution during the event"
                                : "Full access to all consoles, users, decisions, audit log"}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                {form.role === "reviewer" && (
                  <div>
                    <Label htmlFor="exp">
                      Expertise{" "}
                      <span className="text-xs font-normal text-[var(--muted-text)]">
                        (comma-separated)
                      </span>
                    </Label>
                    <Input
                      id="exp"
                      className="mt-2"
                      placeholder="Clinical Pharmacy, Pharmacology"
                      value={form.expertise}
                      onChange={(e) =>
                        setForm({ ...form, expertise: e.target.value })
                      }
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={createUser}
                  disabled={saving || !form.email || !form.name}
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create & send credentials
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Expertise</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-sm text-[var(--muted-text)]"
                  >
                    Loading…
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-sm text-[var(--muted-text)]"
                  >
                    No users yet.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-semibold text-sm">
                      {u.name}
                    </TableCell>
                    <TableCell className="text-sm">{u.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          u.role === "super_admin"
                            ? "default"
                            : u.role === "editorial"
                              ? "info"
                              : u.role === "checkin_staff"
                                ? "success"
                                : "secondary"
                        }
                      >
                        {ROLE_LABEL[u.role] ?? u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {u.expertise?.slice(0, 3).map((e) => (
                        <Badge
                          key={e}
                          variant="outline"
                          className="text-[10px] mr-1"
                        >
                          {e}
                        </Badge>
                      ))}
                    </TableCell>
                    <TableCell>
                      {u.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="danger">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-[var(--muted-text)]">
                      {u.lastLoginAt
                        ? format(new Date(u.lastLoginAt), "d MMM, HH:mm")
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            {u.isActive ? "Deactivate" : "Reactivate"}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {u.isActive ? "Deactivate" : "Reactivate"}{" "}
                              {u.name}?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {u.isActive
                                ? "The user will lose access immediately but audit history is preserved."
                                : "The user will regain access using their existing password."}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => toggleActive(u)}>
                              Confirm
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
