"use client";
import { useContext, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AuthContext from "@/app/context/AuthContext";
import { Icon } from "@iconify/react";
import axios from "axios";
import { toast } from "react-toastify";
import Link from "next/link";

interface Author {
  id: string;
  full_name: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  avatar_url: string | null;
}

interface Post {
  id: number;
  author: Author;
  title: string;
  content: string;
  media_urls: string[];
  created_at: string;
  comment_count: number;
  like_count: number;
  liked_by_me: boolean;
}

interface Comment {
  id: number;
  content: string;
  created_at: string;
  guest_name: string | null;
  user: Author | null;
}

const ANON_TOKEN_KEY = "psikosun.anon_token";
const ANON_NAME_KEY = "psikosun.anon_name";

function getAnonToken(): string {
  if (typeof window === "undefined") return "";
  let t = localStorage.getItem(ANON_TOKEN_KEY);
  if (!t) {
    t =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `anon_${Math.random().toString(36).slice(2)}_${Date.now()}`;
    localStorage.setItem(ANON_TOKEN_KEY, t);
  }
  return t;
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

function roleBadge(role: Author["role"]) {
  if (role === "ADMIN") return { label: "Yönetim", color: "bg-primary/10 text-primary" };
  if (role === "TEACHER") return { label: "Öğretmen", color: "bg-success/10 text-success" };
  return { label: "Öğrenci", color: "bg-gray-100 text-gray-600" };
}

function isImage(url: string) {
  return /\.(jpe?g|png|webp|gif)(\?|$)/i.test(url);
}

export default function KesfetDetailPublicPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);
  const { user, isInitialized } = useContext(AuthContext) as any;
  const role: Author["role"] = user?.role ?? "STUDENT";

  const [anonToken, setAnonToken] = useState<string>("");
  const [anonName, setAnonName] = useState<string>("");
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    setAnonToken(getAnonToken());
    if (typeof window !== "undefined") {
      setAnonName(localStorage.getItem(ANON_NAME_KEY) ?? "");
    }
  }, []);

  useEffect(() => {
    if (!id || !isInitialized) return;
    if (!user?.id && !anonToken) return;
    setLoading(true);
    const q = new URLSearchParams();
    if (user?.id) q.set("viewerId", user.id);
    else if (anonToken) q.set("anonToken", anonToken);
    Promise.all([
      fetch(`/api/discovery/${id}?${q.toString()}`).then((r) => r.json()),
      fetch(`/api/discovery/${id}/comments`).then((r) => r.json()),
    ])
      .then(([pRes, cRes]) => {
        setPost(pRes.data ?? null);
        setComments(cRes.data ?? []);
      })
      .finally(() => setLoading(false));
  }, [id, user?.id, anonToken, isInitialized]);

  const toggleLike = async () => {
    if (!post) return;
    setPost({
      ...post,
      liked_by_me: !post.liked_by_me,
      like_count: post.liked_by_me ? post.like_count - 1 : post.like_count + 1,
    });
    try {
      const body = user?.id ? { user_id: user.id } : { anon_token: anonToken };
      const res = await axios.post(`/api/discovery/${post.id}/like`, body);
      setPost((p) =>
        p ? { ...p, liked_by_me: res.data.liked, like_count: res.data.like_count } : p,
      );
    } catch {
      setPost((p) =>
        p
          ? {
              ...p,
              liked_by_me: !p.liked_by_me,
              like_count: p.liked_by_me ? p.like_count - 1 : p.like_count + 1,
            }
          : p,
      );
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !post) return;
    setPosting(true);
    try {
      const body = user?.id
        ? { user_id: user.id, content: newComment }
        : { guest_name: anonName.trim() || null, content: newComment };
      if (!user?.id && anonName.trim()) {
        localStorage.setItem(ANON_NAME_KEY, anonName.trim());
      }
      const res = await axios.post(`/api/discovery/${post.id}/comments`, body);
      setComments((c) => [...c, res.data.data]);
      setPost((p) => (p ? { ...p, comment_count: p.comment_count + 1 } : p));
      setNewComment("");
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? "Yorum eklenemedi.");
    } finally {
      setPosting(false);
    }
  };

  const deleteComment = async (cid: number) => {
    if (!post || !user?.id) return;
    if (!confirm("Yorumu silmek istediğinize emin misiniz?")) return;
    try {
      await axios.delete(
        `/api/discovery/${post.id}/comments?commentId=${cid}&userId=${user.id}`,
      );
      setComments((c) => c.filter((x) => x.id !== cid));
      setPost((p) => (p ? { ...p, comment_count: p.comment_count - 1 } : p));
    } catch {
      toast.error("Silinemedi.");
    }
  };

  const deletePost = async () => {
    if (!post || !user?.id) return;
    if (!confirm("Bu gönderiyi silmek istediğinize emin misiniz?")) return;
    try {
      await axios.delete(`/api/discovery/${post.id}?userId=${user.id}`);
      toast.success("Silindi.");
      router.push("/kesfet");
    } catch {
      toast.error("Silinemedi.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-16 text-gray-400">
        <Icon icon="tabler:question-mark" width={40} className="mx-auto mb-2 opacity-40" />
        <p>Gönderi bulunamadı.</p>
        <Link href="/kesfet" className="text-primary text-sm hover:underline mt-2 inline-block">
          Keşfet&apos;e dön
        </Link>
      </div>
    );
  }

  const badge = roleBadge(post.author.role);
  const canDeletePost = !!user?.id && (post.author.id === user.id || role === "ADMIN");

  return (
    <>
      <Link
        href="/kesfet"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-4"
      >
        <Icon icon="tabler:arrow-left" width={16} />
        Keşfet
      </Link>

      <article className="bg-white dark:bg-darkgray rounded-xl border border-border dark:border-darkborder p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden text-primary font-semibold">
              {post.author.avatar_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={post.author.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                post.author.full_name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-dark dark:text-white flex items-center gap-2">
                {post.author.full_name}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${badge.color}`}>
                  {badge.label}
                </span>
              </p>
              <p className="text-xs text-gray-400">{timeAgo(post.created_at)}</p>
            </div>
          </div>
          {canDeletePost && (
            <button
              onClick={deletePost}
              className="text-xs text-gray-400 hover:text-error p-1"
              title="Sil"
            >
              <Icon icon="tabler:trash" width={16} />
            </button>
          )}
        </div>

        <h1 className="text-xl font-bold text-dark dark:text-white mt-4">{post.title}</h1>
        <p className="text-sm text-gray-700 dark:text-gray-200 mt-2 whitespace-pre-wrap">
          {post.content}
        </p>

        {post.media_urls.length > 0 && (
          <div
            className={`mt-4 grid gap-2 ${post.media_urls.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
          >
            {post.media_urls.map((u) => (
              <a
                key={u}
                href={u}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg overflow-hidden border border-border dark:border-darkborder bg-gray-50 dark:bg-gray-800"
              >
                {isImage(u) ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={u} alt="" className="w-full object-cover" />
                ) : (
                  <div className="w-full h-56 flex flex-col items-center justify-center text-gray-500">
                    <Icon icon="tabler:file-text" width={32} />
                    <span className="text-xs mt-1">Dosyayı aç</span>
                  </div>
                )}
              </a>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border dark:border-darkborder">
          <button
            onClick={toggleLike}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              post.liked_by_me ? "text-error" : "text-gray-500 hover:text-error"
            }`}
          >
            <Icon
              icon={post.liked_by_me ? "tabler:heart-filled" : "tabler:heart"}
              width={18}
            />
            {post.like_count}
          </button>
          <span className="flex items-center gap-1.5 text-sm text-gray-500">
            <Icon icon="tabler:message-circle" width={18} />
            {post.comment_count}
          </span>
        </div>
      </article>

      <div className="mt-5 bg-white dark:bg-darkgray rounded-xl border border-border dark:border-darkborder p-5">
        <h3 className="font-semibold text-dark dark:text-white mb-3">Yorumlar</h3>

        <form onSubmit={submitComment} className="space-y-2 mb-4">
          {!user?.id && (
            <input
              value={anonName}
              onChange={(e) => setAnonName(e.target.value)}
              maxLength={60}
              placeholder="Adın (opsiyonel)"
              className="w-full text-sm border border-border dark:border-darkborder rounded-lg px-3 py-2 bg-white dark:bg-darkgray focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          )}
          <div className="flex gap-2">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Yorumunu yaz..."
              maxLength={2000}
              className="flex-1 text-sm border border-border dark:border-darkborder rounded-lg px-3 py-2 bg-white dark:bg-darkgray focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              type="submit"
              disabled={posting || !newComment.trim()}
              className="bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-primaryemphasis disabled:opacity-50"
            >
              {posting ? "..." : "Gönder"}
            </button>
          </div>
        </form>

        {comments.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">İlk yorumu sen yap</p>
        ) : (
          <div className="space-y-3">
            {comments.map((c) => {
              const cBadge = c.user
                ? roleBadge(c.user.role)
                : { label: "Misafir", color: "bg-gray-100 text-gray-500" };
              const displayName = c.user?.full_name ?? c.guest_name ?? "Misafir";
              const canDelete =
                !!user?.id && (c.user?.id === user.id || role === "ADMIN");
              return (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden text-primary text-xs font-semibold flex-shrink-0">
                    {c.user?.avatar_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={c.user.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      displayName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-semibold text-dark dark:text-white">
                          {displayName}
                        </p>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${cBadge.color}`}
                        >
                          {cBadge.label}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {timeAgo(c.created_at)}
                        </span>
                      </div>
                      {canDelete && (
                        <button
                          onClick={() => deleteComment(c.id)}
                          className="text-xs text-gray-400 hover:text-error"
                          title="Sil"
                        >
                          <Icon icon="tabler:x" width={14} />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-200 mt-1 whitespace-pre-wrap">
                      {c.content}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
