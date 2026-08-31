"use client";

import { useEffect, useState, useCallback } from "react";
import { UserPlus, Upload, Search, Loader2, Edit, Trash2, ChevronLeft, ChevronRight, RefreshCw, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import PageHeader from "@/components/console/PageHeader";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/shadcn/table";
import { Button } from "@/components/ui/shadcn/button";
import { Badge } from "@/components/ui/shadcn/badge";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription,
} from "@/components/ui/shadcn/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/shadcn/alert-dialog";

interface AptiMemberRow {
  id: string;
  memberId: string;
  serialNo: number | null;
  stateCode: string | null;
  name: string;
  email: string | null;
  mobile: string | null;
  officeAddress: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  createdAt: string;
  updatedAt: string;
}

const EMPTY_MEMBER_FORM = {
  memberId: "",
  name: "",
  email: "",
  mobile: "",
  officeAddress: "",
  city: "",
  state: "",
  pincode: "",
  stateCode: "",
  serialNo: "",
};

export default function AptiMembersClient() {
  const [members, setMembers] = useState<AptiMemberRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Modals state
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editMember, setEditMember] = useState<AptiMemberRow | null>(null);

  // Form states
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [form, setForm] = useState(EMPTY_MEMBER_FORM);
  const [editForm, setEditForm] = useState(EMPTY_MEMBER_FORM);
  const [importText, setImportText] = useState("");

  const loadMembers = useCallback(async (p = page, q = search) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: p.toString(),
        limit: "20",
        ...(q ? { search: q } : {}),
      });
      const res = await fetch(`/api/admin/apti-members?${params}`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
        setTotal(data.total || 0);
        setPage(data.page || 1);
        setTotalPages(data.totalPages || 1);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to load members");
      }
    } catch {
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadMembers(1, search);
  }, [search, loadMembers]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadMembers(1, search);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      loadMembers(newPage, search);
    }
  };

  const createMember = async () => {
    if (!form.memberId.trim() || !form.name.trim()) {
      toast.error("Member ID and Name are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        memberId: form.memberId.trim(),
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        mobile: form.mobile.trim() || undefined,
        officeAddress: form.officeAddress.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        pincode: form.pincode.trim() || undefined,
        stateCode: form.stateCode.trim() || undefined,
        serialNo: form.serialNo ? Number(form.serialNo) : undefined,
      };

      const res = await fetch("/api/admin/apti-members", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to create APTI member");

      toast.success(`APTI Member ${body.member.memberId} added successfully.`);
      setAddOpen(false);
      setForm(EMPTY_MEMBER_FORM);
      await loadMembers(1, search);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create APTI member");
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (m: AptiMemberRow) => {
    setEditMember(m);
    setEditForm({
      memberId: m.memberId,
      name: m.name,
      email: m.email || "",
      mobile: m.mobile || "",
      officeAddress: m.officeAddress || "",
      city: m.city || "",
      state: m.state || "",
      pincode: m.pincode || "",
      stateCode: m.stateCode || "",
      serialNo: m.serialNo ? String(m.serialNo) : "",
    });
  };

  const updateMember = async () => {
    if (!editMember) return;
    if (!editForm.name.trim()) {
      toast.error("Name is required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: editForm.name.trim(),
        email: editForm.email.trim() || undefined,
        mobile: editForm.mobile.trim() || undefined,
        officeAddress: editForm.officeAddress.trim() || undefined,
        city: editForm.city.trim() || undefined,
        state: editForm.state.trim() || undefined,
        pincode: editForm.pincode.trim() || undefined,
        stateCode: editForm.stateCode.trim() || undefined,
        serialNo: editForm.serialNo ? Number(editForm.serialNo) : undefined,
      };

      const res = await fetch(`/api/admin/apti-members/${editMember.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to update member");

      toast.success(`Updated member ${editMember.memberId}`);
      setEditMember(null);
      await loadMembers(page, search);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update member");
    } finally {
      setSaving(false);
    }
  };

  const deleteMember = async (m: AptiMemberRow) => {
    try {
      const res = await fetch(`/api/admin/apti-members/${m.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`Deleted APTI Member ${m.memberId}`);
        await loadMembers(page, search);
      } else {
        const body = await res.json();
        toast.error(body.error || "Failed to delete member");
      }
    } catch {
      toast.error("Failed to delete member");
    }
  };

  const handleImport = async () => {
    if (!importText.trim()) {
      toast.error("Please paste JSON or CSV member data to import.");
      return;
    }
    setImporting(true);
    try {
      let parsedMembers: Record<string, unknown>[] = [];
      const trimmed = importText.trim();

      if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
        const parsed = JSON.parse(trimmed);
        parsedMembers = Array.isArray(parsed) ? parsed : [parsed];
      } else {
        // Parse CSV format (assuming header row or standard lines)
        const lines = trimmed.split("\n").map((l) => l.trim()).filter(Boolean);
        if (lines.length > 0) {
          const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ""));
          const hasHeader = headers.some((h) => h.includes("member") || h.includes("name"));
          const startIdx = hasHeader ? 1 : 0;

          for (let i = startIdx; i < lines.length; i++) {
            const cols = lines[i].split(",").map((c) => c.trim());
            if (cols.length >= 2) {
              if (hasHeader) {
                const rowObj: Record<string, unknown> = {};
                headers.forEach((h, idx) => {
                  if (idx < cols.length) {
                    if (h.includes("id")) rowObj.memberId = cols[idx];
                    else if (h.includes("name")) rowObj.name = cols[idx];
                    else if (h.includes("email")) rowObj.email = cols[idx];
                    else if (h.includes("mobile") || h.includes("phone")) rowObj.mobile = cols[idx];
                    else if (h.includes("city")) rowObj.city = cols[idx];
                    else if (h.includes("state")) rowObj.state = cols[idx];
                    else if (h.includes("pincode") || h.includes("zip")) rowObj.pincode = cols[idx];
                  }
                });
                if (rowObj.memberId && rowObj.name) parsedMembers.push(rowObj);
              } else {
                // Default order: Member ID, Name, Email, Mobile, City, State
                parsedMembers.push({
                  memberId: cols[0],
                  name: cols[1],
                  email: cols[2] || undefined,
                  mobile: cols[3] || undefined,
                  city: cols[4] || undefined,
                  state: cols[5] || undefined,
                });
              }
            }
          }
        }
      }

      if (parsedMembers.length === 0) {
        throw new Error("Could not parse any valid APTI members from provided input.");
      }

      const res = await fetch("/api/admin/apti-members/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ members: parsedMembers }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to import members");

      toast.success(`Successfully imported ${body.importedCount} APTI member(s).`);
      setImportOpen(false);
      setImportText("");
      await loadMembers(1, search);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to parse and import members");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <PageHeader
        title="APTI Members Registry"
        description="Search, view, add, and manage registered Association of Pharmaceutical Teachers of India (APTI) members."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Import Dialog */}
            <Dialog open={importOpen} onOpenChange={setImportOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Batch
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>Import APTI Members</DialogTitle>
                  <DialogDescription>
                    Paste JSON array or CSV text containing APTI members to bulk upsert into the registry.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div>
                    <Label htmlFor="importData">JSON or CSV Data</Label>
                    <textarea
                      id="importData"
                      rows={8}
                      className="mt-2 w-full p-3 font-mono text-xs border rounded-lg bg-[var(--surface-50)] text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-800)]"
                      placeholder={`JSON Example:\n[\n  { "memberId": "MA/LM-1234", "name": "Dr. Jane Doe", "email": "jane@example.com", "state": "Maharashtra" }\n]\n\nCSV Example:\nMember ID, Name, Email, Mobile, City, State\nMA/LM-1234, Dr. Jane Doe, jane@example.com, 9876543210, Mumbai, Maharashtra`}
                      value={importText}
                      onChange={(e) => setImportText(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setImportOpen(false)}>Cancel</Button>
                  <Button onClick={handleImport} disabled={importing || !importText.trim()}>
                    {importing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Import Members
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Add Member Dialog */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>Add New APTI Member</DialogTitle>
                  <DialogDescription>Add a single member to the official APTI registry.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
                  <div>
                    <Label htmlFor="memberId">Member ID *</Label>
                    <Input
                      id="memberId"
                      placeholder="e.g. KA/LM-123"
                      className="mt-1"
                      value={form.memberId}
                      onChange={(e) => setForm({ ...form, memberId: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="Dr. John Smith"
                      className="mt-1"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      className="mt-1"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mobile">Mobile</Label>
                    <Input
                      id="mobile"
                      placeholder="+91 9876543210"
                      className="mt-1"
                      value={form.mobile}
                      onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="Bangalore"
                      className="mt-1"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      placeholder="Karnataka"
                      className="mt-1"
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      placeholder="560001"
                      className="mt-1"
                      value={form.pincode}
                      onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="stateCode">State Code</Label>
                    <Input
                      id="stateCode"
                      placeholder="KA"
                      className="mt-1"
                      value={form.stateCode}
                      onChange={(e) => setForm({ ...form, stateCode: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="officeAddress">Office Address</Label>
                    <Input
                      id="officeAddress"
                      placeholder="Department of Pharmacy, University..."
                      className="mt-1"
                      value={form.officeAddress}
                      onChange={(e) => setForm({ ...form, officeAddress: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                  <Button onClick={createMember} disabled={saving || !form.memberId || !form.name}>
                    {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Member
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Filter and stats row */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-text)]" />
            <Input
              type="search"
              placeholder="Search by Member ID, name, email, city..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="submit" variant="outline">Search</Button>
        </form>

        <div className="flex items-center gap-4 text-sm font-medium">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[var(--accent-500)]/20 shadow-xs">
            <BadgeCheck className="w-4 h-4 text-[var(--primary-800)]" />
            <span>Total Members: <strong className="text-[var(--primary-800)]">{total}</strong></span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => loadMembers(page, search)} title="Refresh list">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-sm text-[var(--muted-text)]">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[var(--primary-800)]" />
                    Loading APTI members...
                  </TableCell>
                </TableRow>
              ) : members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-sm text-[var(--muted-text)]">
                    No APTI members found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                members.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-mono text-xs font-bold text-[var(--primary-800)]">
                      {m.memberId}
                      {m.stateCode && <Badge variant="outline" className="ml-2 text-[10px]">{m.stateCode}</Badge>}
                    </TableCell>
                    <TableCell className="font-semibold text-sm">
                      {m.name}
                      {m.serialNo && <div className="text-[10px] font-normal text-[var(--muted-text)]">Sl. #{m.serialNo}</div>}
                    </TableCell>
                    <TableCell className="text-xs">
                      <div>{m.email || <span className="text-[var(--muted-text)] italic">No email</span>}</div>
                      <div className="text-[var(--muted-text)]">{m.mobile}</div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div>{[m.city, m.state].filter(Boolean).join(", ") || "—"}</div>
                      {m.pincode && <div className="text-[var(--muted-text)]">{m.pincode}</div>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(m)} title="Edit">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete APTI Member?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete member <strong>{m.memberId}</strong> ({m.name})? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => deleteMember(m)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editMember && (
        <Dialog open={!!editMember} onOpenChange={(open) => !open && setEditMember(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Edit APTI Member: {editMember.memberId}</DialogTitle>
              <DialogDescription>Update member details in the APTI registry.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
              <div>
                <Label htmlFor="editName">Full Name *</Label>
                <Input
                  id="editName"
                  className="mt-1"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  className="mt-1"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editMobile">Mobile</Label>
                <Input
                  id="editMobile"
                  className="mt-1"
                  value={editForm.mobile}
                  onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editCity">City</Label>
                <Input
                  id="editCity"
                  className="mt-1"
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editState">State</Label>
                <Input
                  id="editState"
                  className="mt-1"
                  value={editForm.state}
                  onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editPincode">Pincode</Label>
                <Input
                  id="editPincode"
                  className="mt-1"
                  value={editForm.pincode}
                  onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editStateCode">State Code</Label>
                <Input
                  id="editStateCode"
                  className="mt-1"
                  value={editForm.stateCode}
                  onChange={(e) => setEditForm({ ...editForm, stateCode: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editSerialNo">Serial No.</Label>
                <Input
                  id="editSerialNo"
                  className="mt-1"
                  value={editForm.serialNo}
                  onChange={(e) => setEditForm({ ...editForm, serialNo: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="editOfficeAddress">Office Address</Label>
                <Input
                  id="editOfficeAddress"
                  className="mt-1"
                  value={editForm.officeAddress}
                  onChange={(e) => setEditForm({ ...editForm, officeAddress: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditMember(null)}>Cancel</Button>
              <Button onClick={updateMember} disabled={saving || !editForm.name}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Update Member
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-[var(--muted-text)]">
          <div>
            Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({total} total items)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
