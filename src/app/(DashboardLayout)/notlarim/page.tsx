"use client";
import { useContext, useEffect, useState } from "react";
import AuthContext from "@/app/context/AuthContext";
import { Icon } from "@iconify/react";

interface Note {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
  teacher: { full_name: string };
  lesson: { scheduled_at: string } | null;
}

export default function NotlarimPage() {
  const { user } = useContext(AuthContext);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/notes?studentId=${user.id}`)
      .then((r) => r.json())
      .then(({ data }) => { setNotes(data || []); setLoading(false); });
  }, [user?.id]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark dark:text-white">Notlarım</h1>
        <p className="text-sm text-gray-500 mt-1">Öğretmeninizin sizin için tuttuğu notlar</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : notes.length === 0 ? (
        <div className="bg-white dark:bg-darkgray rounded-xl p-12 text-center shadow-sm border border-border dark:border-darkborder">
          <Icon icon="tabler:notes-off" width={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400">Henüz not eklenmemiş.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div key={note.id} className="bg-white dark:bg-darkgray rounded-xl p-5 shadow-sm border border-border dark:border-darkborder">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon icon="tabler:user" className="text-primary" width={14} />
                  </div>
                  <span className="text-sm font-medium text-dark dark:text-white">{note.teacher.full_name}</span>
                  {note.lesson && (
                    <span className="text-xs text-gray-400">
                      — {new Date(note.lesson.scheduled_at).toLocaleDateString("tr-TR")} dersi
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(note.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{note.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
