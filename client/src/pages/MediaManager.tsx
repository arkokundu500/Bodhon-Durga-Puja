import { useState } from "react";
import { Link } from "wouter";
import { Upload, Music2, ImagePlus, ArrowLeft, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

function fileAsBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

export default function MediaManager() {
  const mediaQuery = trpc.media.list.useQuery();
  const upload = trpc.media.upload.useMutation({
    onSuccess: () => {
      toast.success("Media uploaded to Bodhon storage");
      void mediaQuery.refetch();
      setFile(null);
    },
    onError: (error) => toast.error(error.message),
  });
  const [kind, setKind] = useState<"audio" | "cover">("audio");
  const [file, setFile] = useState<File | null>(null);
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file || !slug || !title || !subtitle) {
      toast.error("Add a file, slug, title, and subtitle first");
      return;
    }
    try {
      upload.mutate({ kind, slug, title, subtitle, filename: file.name, mimeType: file.type || (kind === "audio" ? "audio/mpeg" : "image/jpeg"), base64: await fileAsBase64(file) });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not read the file");
    }
  };

  return <DashboardLayout><main className="min-h-screen bg-[#F8F1E4] p-6 text-[#2A201A] lg:p-10"><div className="mx-auto max-w-6xl"><Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#B52A22] hover:underline"><ArrowLeft size={16} /> Back to Bodhon</Link><div className="mt-8 flex flex-col justify-between gap-4 border-b border-[#B52A22]/10 pb-7 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#B52A22]">Bodhon Studio · admin</p><h1 className="mt-3 font-serif text-5xl font-black leading-none">Media Manager</h1><p className="mt-3 max-w-xl text-sm leading-6 text-[#80675A]">Upload a new cover or song to managed storage. The public radio can read the persisted media catalog without editing the frontend.</p></div><span className="rounded-full border border-[#E5A62C]/55 bg-[#FFF4D7] px-4 py-2 text-xs font-bold text-[#B52A22]">S3-backed catalog</span></div><div className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]"><form onSubmit={submit} className="rounded-[30px] border border-[#B52A22]/12 bg-[#FFF9EF] p-6 shadow-[0_18px_52px_rgba(91,47,28,0.08)]"><div className="flex gap-2"><button type="button" onClick={() => setKind("audio")} className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-bold ${kind === "audio" ? "bg-[#B52A22] text-[#FFF9EF]" : "bg-[#F3E7D5] text-[#80675A]"}`}><Music2 size={16} /> Audio</button><button type="button" onClick={() => setKind("cover")} className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-bold ${kind === "cover" ? "bg-[#B52A22] text-[#FFF9EF]" : "bg-[#F3E7D5] text-[#80675A]"}`}><ImagePlus size={16} /> Cover</button></div><label className="mt-6 block text-xs font-bold uppercase tracking-[0.14em] text-[#80675A]">File<input type="file" accept={kind === "audio" ? "audio/*" : "image/*"} onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="mt-2 block w-full rounded-2xl border border-dashed border-[#B52A22]/25 bg-[#F8F1E4] p-4 text-sm" /></label><label className="mt-5 block text-xs font-bold uppercase tracking-[0.14em] text-[#80675A]">Slug<Input value={slug} onChange={(event) => setSlug(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} placeholder="dugga-elo-audio" className="mt-2" /></label><label className="mt-5 block text-xs font-bold uppercase tracking-[0.14em] text-[#80675A]">Title<Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="দুগ্গা এলো" className="mt-2" /></label><label className="mt-5 block text-xs font-bold uppercase tracking-[0.14em] text-[#80675A]">Subtitle<Textarea value={subtitle} onChange={(event) => setSubtitle(event.target.value)} placeholder="শহরে মায়ের arrival" className="mt-2" /></label><Button type="submit" disabled={upload.isPending} className="mt-6 w-full rounded-full bg-[#B52A22] text-[#FFF9EF] hover:bg-[#90231D]">{upload.isPending ? <><Loader2 size={16} className="mr-2 animate-spin" /> Uploading…</> : <><Upload size={16} className="mr-2" /> Upload to storage</>}</Button></form><section className="rounded-[30px] border border-[#B52A22]/12 bg-[#EFE2CF] p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#B52A22]">Persistent catalog</p><h2 className="mt-2 font-serif text-3xl font-black">Uploaded media</h2></div><span className="text-xs font-semibold text-[#80675A]">{mediaQuery.data?.length ?? 0} assets</span></div><div className="mt-6 space-y-3">{mediaQuery.isLoading ? <p className="text-sm text-[#80675A]">Loading catalog…</p> : mediaQuery.data?.length ? mediaQuery.data.map((asset) => <div key={asset.id} className="flex items-center gap-3 rounded-2xl border border-[#B52A22]/10 bg-[#FFF9EF]/80 p-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#B52A22] text-[#FFF9EF]">{asset.kind === "audio" ? <Music2 size={17} /> : <ImagePlus size={17} />}</span><div className="min-w-0 flex-1"><p className="truncate font-semibold text-[#2A201A]">{asset.title}</p><p className="truncate text-xs text-[#80675A]">{asset.slug} · {asset.mimeType}</p></div><a href={asset.url} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#B52A22] hover:underline">Open ↗</a></div>) : <p className="rounded-2xl bg-[#FFF9EF]/70 p-4 text-sm leading-6 text-[#80675A]">No database assets yet. Upload the four song/cover pairs here when preparing a new festival edition.</p>}</div></section></div></div></main></DashboardLayout>;
}
