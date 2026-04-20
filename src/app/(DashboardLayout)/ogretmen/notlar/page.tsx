"use client";
import { useContext, useEffect, useState } from "react";
import AuthContext from "@/app/context/AuthContext";
import { Icon } from "@iconify/react";
import axios from "axios";
import { toast } from "react-toastify";

interface Note {
  id: number;
  content: string;
  created_at: string;
  student: { id: string; full_name: string };
  lesson: { scheduled_at: string } | null;
}

interface Student {
  id: string;
  full_name: string;
}

export default function OgretmenNotlarPage() {
  const { user } = useContext(AuthContext);
  const [notes, setNotes] = useState<Note[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ student_id: "", content: "" });

  const fetchNotes = () => {
    if (!user?.id) return;
    fetch(`/api/notes?teacherId=${user.id}`)
      .then((r) => r.json())
      .then(({ data }) => { setNotes(data || []); setLoading(false); });
  };

  useEffect(() => {
    if (!user?.id) return;
    fetchNotes();
    fetch(`/api/students?teacherId=${user.id}`)
      .then((r) => r.json())
      .then(({ data }) => setStudents(data || []));
  }, [user?.id]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/notes", { student_id: form.student_id, teacher_id: user?.id, content: form.content });
      toast.success("Not eklendi.");
      setShowForm(false);
      setForm({ student_id: "", content: "" });
      fetchNotes();
    } catch {
      toast.error("Not eklenemedi.");
    }
  };

  const filtered = selectedStudent === "ALL" ? notes : notes.filter((n) => n.student.id === selectedStudent);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Öğrenci Notları</h1>
          <p className="text-sm text-gray-500 mt-1">Öğrencileriniz için tuttuğunuz notlar</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-primaryemphasis transition-colors"
        >
          <Icon icon="tabler:plus" width={16} />
          Not Ekle
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddNote} className="bg-white dark:bg-darkgray rounded-xl p-5 shadow-sm border border-primary mb-5">
          <h3 className="font-semibold text-dark dark:text-white mb-4">Yeni Not</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Öğrenci</label>
              <select
                required
                value={form.student_id}
                onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                className="w-full text-sm border border-border dark:border-darkborder rounded-lg px-3 py-2 bg-white dark:bg-darkgray focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Öğrenci seçin</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Not</label>
              <textarea
                required
                rows={4}
                placeholder="Notunuzu yazın..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full text-sm border border-border dark:border-darkborder rounded-lg px-3 py-2 bg-white dark:bg-darkgray focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="bg-primary text-white text-sm px-5 py-2 rounded-lg hover:bg-primaryemphasis">Kaydet</button>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm px-5 py-2 rounded-lg border border-border hover:bg-gray-50">İptal</button>
          </div>
        </form>
      )}

      {/* Öğrenci filtresi */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <button onClick={() => setSelectedStudent("ALL")}
          className={`text-sm px-4 py-2 rounded-lg transition-colors ${selectedStudent === "ALL" ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600"}`}>
          Tümü
        </button>
        {students.map((s) => (
          <button key={s.id} onClick={() => setSelectedStudent(s.id)}
            className={`text-sm px-4 py-2 rounded-lg transition-colors ${selectedStudent === s.id ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600"}`}>
            {s.full_name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-darkgray rounded-xl p-12 text-center shadow-sm border border-border dark:border-darkborder">
          <Icon icon="tabler:notes-off" width={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400">Henüz not yok.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((note) => (
            <div key={note.id} className="bg-white dark:bg-darkgray rounded-xl p-5 shadow-sm border border-border dark:border-darkborder">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon icon="tabler:user" className="text-primary" width={14} />
                  </div>
                  <span className="text-sm font-medium text-dark dark:text-white">{note.student.full_name}</span>
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
