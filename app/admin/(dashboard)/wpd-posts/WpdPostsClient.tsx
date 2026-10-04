"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Loader2, Search } from "lucide-react";
import PageHeader from "@/components/console/PageHeader";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { Input } from "@/components/ui/shadcn/input";
import { Button } from "@/components/ui/shadcn/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/shadcn/table";

type Post = { id: string; name: string; designation: string; organization: string; email: string; mobile: string; photoUrl: string; createdAt: string };
const PAGE_SIZE = 25;

export default function WpdPostsClient() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(`/api/admin/wpd-posts?q=${encodeURIComponent(q)}&page=${page}&limit=${PAGE_SIZE}`);
      if (res.ok) { const data = await res.json(); setPosts(data.posts); setTotal(data.total); }
      setLoading(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [q, page]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return <div className="p-4 md:p-8">
    <PageHeader title="WPD Posts" description="All World Pharmacists Day posts submitted by participants." />
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
          <div className="relative w-full sm:max-w-md"><Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--muted-text)]" /><Input className="pl-9" placeholder="Search name, email, mobile, organization…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} /></div>
          <p className="text-sm text-[var(--muted-text)]">{total.toLocaleString("en-IN")} posts</p>
        </div>
        <div className="overflow-x-auto">
          <Table><TableHeader><TableRow><TableHead>Post creator</TableHead><TableHead>Contact</TableHead><TableHead>Organization</TableHead><TableHead>Submitted</TableHead><TableHead>Photo</TableHead></TableRow></TableHeader>
            <TableBody>{loading ? <TableRow><TableCell colSpan={5} className="h-32 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></TableCell></TableRow> : posts.length === 0 ? <TableRow><TableCell colSpan={5} className="h-32 text-center text-[var(--muted-text)]">No WPD posts found.</TableCell></TableRow> : posts.map((post) => <TableRow key={post.id}><TableCell><div className="font-semibold">{post.name}</div><div className="text-xs text-[var(--muted-text)]">{post.designation}</div></TableCell><TableCell><div>{post.email}</div><div className="text-xs text-[var(--muted-text)]">{post.mobile}</div></TableCell><TableCell>{post.organization}</TableCell><TableCell className="whitespace-nowrap">{new Date(post.createdAt).toLocaleDateString("en-IN")}</TableCell><TableCell>{post.photoUrl ? <a href={post.photoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-[var(--primary-800)] hover:underline">View <ExternalLink className="h-3 w-3" /></a> : "—"}</TableCell></TableRow>)}</TableBody>
          </Table>
        </div>
        <div className="mt-5 flex items-center justify-between"><span className="text-xs text-[var(--muted-text)]">Page {page} of {pages}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /> Previous</Button><Button variant="outline" size="sm" disabled={page >= pages || loading} onClick={() => setPage((p) => p + 1)}>Next <ChevronRight className="h-4 w-4" /></Button></div></div>
      </CardContent>
    </Card>
  </div>;
}
