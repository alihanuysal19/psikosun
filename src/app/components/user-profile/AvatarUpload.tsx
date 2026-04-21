"use client";
import { Icon } from "@iconify/react";
import axios from "axios";
import { useRef, useState } from "react";
import { toast } from "react-toastify";

type Props = {
  userId: string;
  initialUrl: string | null;
  displayName: string;
  onChange?: (url: string | null) => void;
};

export default function AvatarUpload({ userId, initialUrl, displayName, onChange }: Props) {
  const [url, setUrl] = useState<string | null>(initialUrl);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const initials = displayName
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleFile = async (file: File) => {
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("user_id", userId);
      fd.append("file", file);
      const { data } = await axios.post("/api/profile/avatar", fd);
      const newUrl = data.data.avatar_url as string;
      setUrl(newUrl);
      onChange?.(newUrl);
      toast.success("Fotoğraf güncellendi");
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? "Yüklenemedi");
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    if (!url) return;
    if (!confirm("Profil fotoğrafı kaldırılsın mı?")) return;
    setBusy(true);
    try {
      await axios.delete(`/api/profile/avatar?user_id=${userId}`);
      setUrl(null);
      onChange?.(null);
      toast.success("Fotoğraf kaldırıldı");
    } catch {
      toast.error("Silinemedi");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-5">
      <div className="relative">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden"
          style={{
            background: url
              ? "transparent"
              : "linear-gradient(135deg,#7c3aed 0%,#00bcd4 100%)",
            boxShadow: "0 10px 30px -10px rgba(124,58,237,0.4)",
          }}
        >
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white font-black text-xl tracking-wide">
              {initials || "?"}
            </span>
          )}
        </div>
        {busy && (
          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
            <Icon icon="tabler:loader-2" className="text-white animate-spin" width={22} />
          </div>
        )}
      </div>

      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="text-sm inline-flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primaryemphasis disabled:opacity-50"
          >
            <Icon icon="tabler:upload" width={14} />
            {url ? "Fotoğrafı değiştir" : "Fotoğraf yükle"}
          </button>
          {url && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={busy}
              className="text-sm text-error hover:underline"
            >
              Kaldır
            </button>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-1">JPG/PNG/WebP · en fazla 3 MB</p>
      </div>
    </div>
  );
}
