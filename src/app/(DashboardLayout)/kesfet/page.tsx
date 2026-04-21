"use client";
import { useContext, useEffect, useRef, useState } from "react";
import AuthContext from "@/app/context/AuthContext";
import { Icon } from "@iconify/react";
import axios from "axios";
import { toast } from "react-toastify";
import Link from "next/link";

interface PostAuthor {
  id: string;
  full_name: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  avatar_url: string | null;
}

interface Post {
  id: number;
  author: PostAuthor;
  title: string;
  content: string;
  media_urls: string[];
  created_at: string;
  comment_count: number;
  like_count: number;
  liked_by_me: boolean;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "az önce";
  if (m < 60) return `${m} dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} saat önce`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} gün önce`;
  return new Date(iso).toLocaleDateString("tr-TR");
}

function roleBadge(role: PostAuthor["role"]) {
  if (role === "ADMIN") return { label: "Yönetim", color: "bg-primary/10 text-primary" };
  if (role === "TEACHER") return { label: "Öğretmen", color: "bg-success/10 text-success" };
  return { label: "Öğrenci", color: "bg-gray-100 text-gray-600" };
}

function isImage(url: string) {
  return /\.(jpe?g|png|webp|gif)(\?|$)/i.test(url);
}

export default function KesfetPage() {
  const { user } = useContext(AuthContext) as any;
  const role: "STUDENT" | "TEACHER" | "ADMIN" = user?.role ?? "STUDENT";
  const canPost = role === "TEACHER" || role === "ADMIN";

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const [composerOpen, setComposerOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async (cursor?: number) => {
    if (!user?.id) return;
    const q = new URLSearchParams({ viewerId: user.id });
    if (cursor) q.set("cursor", String(cursor));
    const res = await fetch(`/api/discovery?${q.toString()}`);
    const { data, nextCursor: nc } = await res.json();
    return { data: data as Post[], nextCursor: nc as number | null };
  };

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    load().then((r) => {
      if (r) {
        setPosts(r.data);
        setNextCursor(r.nextCursor);
      }
      setLoading(false);
    });
  }, [user?.id]);

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    const r = await load(nextCursor);
    if (r) {
      setPosts((p) => [...p, ...r.data]);
      setNextCursor(r.nextCursor);
    }
    setLoadingMore(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user?.id) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files)) {
        const fd = new FormData();
        fd.append("user_id", user.id);
        fd.append("file", f);
        const res = await axios.post("/api/discovery/media", fd);
        urls.push(res.data.data.url);
      }
      setMediaUrls((prev) => [...prev, ...urls].slice(0, 10));
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? "Yükleme başarısız.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeMedia = (i: number) => {
    setMediaUrls((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Başlık ve içerik zorunlu.");
      return;
    }
    setSaving(true);
    try {
      const res = await axios.post("/api/discovery", {
        author_id: user.id,
        title: form.title,
        content: form.content,
        media_urls: mediaUrls,
      });
      setPosts((p) => [res.data.data, ...p]);
      setForm({ title: "", content: "" });
      setMediaUrls([]);
      setComposerOpen(false);
      toast.success("Paylaşıldı.");
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? "Paylaşılamadı.");
    } finally {
      setSaving(false);
    }
  };

  const toggleLike = async (postId: number) => {
    if (!user?.id) return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              liked_by_me: !p.liked_by_me,
              like_count: p.liked_by_me ? p.like_count - 1 : p.like_count + 1,
            }
          : p,
      ),
    );
    try {
      const res = await axios.post(`/api/discovery/${postId}/like`, { user_id: user.id });
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, liked_by_me: res.data.liked, like_count: res.data.like_count }
            : p,
        ),
      );
    } catch {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                liked_by_me: !p.liked_by_me,
                like_count: p.liked_by_me ? p.like_count - 1 : p.like_count + 1,
              }
            : p,
        ),
      );
      toast.error("İşlem başarısız.");
    }
  };

  const handleDelete = async (postId: number) => {
    if (!confirm("Bu gönderiyi silmek istediğinize emin misiniz?")) return;
    try {
      await axios.delete(`/api/discovery/${postId}?userId=${user.id}`);
      setPosts((p) => p.filter((x) => x.id !== postId));
      toast.success("Silindi.");
    } catch {
      toast.error("Silinemedi.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Keşfet</h1>
          <p className="text-sm text-gray-500 mt-1">
            Topluluktan paylaşımlar, içerikler ve kaynaklar
          </p>
        </div>
        {canPost && (
          <button
            onClick={() => setComposerOpen((s) => !s)}
            className="flex items-center gap-2 bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-primaryemphasis"
          >
            <Icon icon={composerOpen ? "tabler:x" : "tabler:plus"} width={16} />
            {composerOpen ? "Kapat" : "Paylaş"}
          </button>
        )}
      </div>

      {composerOpen && canPost && (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-darkgray rounded-xl p-5 shadow-sm border border-primary mb-5"
        >
          <div className="space-y-3">
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Başlık"
              className="w-full text-base font-semibold border-b border-border dark:border-darkborder pb-2 bg-transparent focus:outline-none focus:border-primary"
            />
            <textarea
              required
              rows={4}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Ne paylaşmak istersin?"
              className="w-full text-sm border border-border dark:border-darkborder rounded-lg px-3 py-2 bg-white dark:bg-darkgray focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />

            {mediaUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {mediaUrls.map((u, i) => (
                  <div
                    key={u}
                    className="relative rounded-lg overflow-hidden border border-border dark:border-darkborder group"
                  >
                    {isImage(u) ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={u} alt="" className="w-full h-24 object-cover" />
                    ) : (
                      <div className="w-full h-24 flex items-center justify-center bg-gray-50 dark:bg-gray-800 text-xs text-gray-500">
                        <Icon icon="tabler:file-text" width={20} className="mr-1" />
                        Dosya
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeMedia(i)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Icon icon="tabler:x" width={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <label className="inline-flex items-center gap-2 text-sm text-primary cursor-pointer hover:underline">
                <Icon icon="tabler:paperclip" width={16} />
                {uploading ? "Yükleniyor..." : "Medya/Dosya ekle"}
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={handleUpload}
                  disabled={uploading || mediaUrls.length >= 10}
                  className="hidden"
                />
              </label>
              <button
                type="submit"
                disabled={saving || uploading}
                className="bg-primary text-white text-sm px-5 py-2 rounded-lg hover:bg-primaryemphasis disabled:opacity-50"
              >
                {saving ? "Paylaşılıyor..." : "Paylaş"}
              </button>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white dark:bg-darkgray rounded-xl border border-border dark:border-darkborder">
          <Icon icon="tabler:sparkles" width={40} className="mx-auto mb-2 opacity-40" />
          <p>Henüz paylaşım yok.</p>
          {canPost && (
            <button
              onClick={() => setComposerOpen(true)}
              className="text-primary text-sm hover:underline mt-2"
            >
              İlk paylaşımı yap
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => {
            const badge = roleBadge(p.author.role);
            const canDelete = p.author.id === user?.id || role === "ADMIN";
            return (
              <article
                key={p.id}
                className="bg-white dark:bg-darkgray rounded-xl border border-border dark:border-darkborder p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden text-primary font-semibold">
                      {p.author.avatar_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={p.author.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        p.author.full_name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-dark dark:text-white flex items-center gap-2">
                        {p.author.full_name}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${badge.color}`}>
                          {badge.label}
                        </span>
                      </p>
                      <p className="text-xs text-gray-400">{timeAgo(p.created_at)}</p>
                    </div>
                  </div>
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-xs text-gray-400 hover:text-error p-1"
                      title="Sil"
                    >
                      <Icon icon="tabler:trash" width={16} />
                    </button>
                  )}
                </div>

                <Link href={`/kesfet/${p.id}`} className="block mt-3 group">
                  <h2 className="text-lg font-semibold text-dark dark:text-white group-hover:text-primary transition-colors">
                    {p.title}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-wrap line-clamp-4">
                    {p.content}
                  </p>
                </Link>

                {p.media_urls.length > 0 && (
                  <div
                    className={`mt-3 grid gap-2 ${p.media_urls.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
                  >
                    {p.media_urls.slice(0, 4).map((u, i) => (
                      <a
                        key={u}
                        href={u}
                        target="_blank"
                        rel="noreferrer"
                        className="relative rounded-lg overflow-hidden border border-border dark:border-darkborder bg-gray-50 dark:bg-gray-800"
                      >
                        {isImage(u) ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={u} alt="" className="w-full h-56 object-cover" />
                        ) : (
                          <div className="w-full h-56 flex flex-col items-center justify-center text-gray-500">
                            <Icon icon="tabler:file-text" width={32} />
                            <span className="text-xs mt-1">Dosyayı aç</span>
                          </div>
                        )}
                        {i === 3 && p.media_urls.length > 4 && (
                          <div className="absolute inset-0 bg-black/50 text-white text-xl font-semibold flex items-center justify-center">
                            +{p.media_urls.length - 4}
                          </div>
                        )}
                      </a>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border dark:border-darkborder">
                  <button
                    onClick={() => toggleLike(p.id)}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${
                      p.liked_by_me ? "text-error" : "text-gray-500 hover:text-error"
                    }`}
                  >
                    <Icon
                      icon={p.liked_by_me ? "tabler:heart-filled" : "tabler:heart"}
                      width={18}
                    />
                    {p.like_count}
                  </button>
                  <Link
                    href={`/kesfet/${p.id}`}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary"
                  >
                    <Icon icon="tabler:message-circle" width={18} />
                    {p.comment_count}
                  </Link>
                </div>
              </article>
            );
          })}

          {nextCursor && (
            <div className="text-center py-4">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="text-sm text-primary hover:underline disabled:opacity-50"
              >
                {loadingMore ? "Yükleniyor..." : "Daha fazla göster"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
