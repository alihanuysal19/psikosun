"use client";
import { useContext, useEffect, useRef, useState } from "react";
import AuthContext from "@/app/context/AuthContext";
import { Icon } from "@iconify/react";
import axios from "axios";

interface Partner {
  id: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
}

interface Conversation {
  partner: Partner;
  last_message: { content: string; created_at: string; sender_id: string } | null;
  unread_count: number;
}

interface Message {
  id: number;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

export default function MesajlarPage() {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activePartner, setActivePartner] = useState<Partner | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadConversations = async () => {
    if (!user?.id) return;
    try {
      const { data } = await axios.get(`/api/messages/conversations?userId=${user.id}`);
      setConversations(data.data ?? []);
      if (!activePartner && data.data?.length) setActivePartner(data.data[0].partner);
    } finally {
      setLoadingList(false);
    }
  };

  const loadMessages = async (partnerId: string) => {
    if (!user?.id) return;
    setLoadingChat(true);
    try {
      const { data } = await axios.get(
        `/api/messages?userId=${user.id}&partnerId=${partnerId}`,
      );
      setMessages(data.data ?? []);
    } finally {
      setLoadingChat(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [user?.id]);

  useEffect(() => {
    if (activePartner) loadMessages(activePartner.id);
  }, [activePartner?.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    if (!user?.id) return;
    const iv = setInterval(() => {
      if (activePartner) loadMessages(activePartner.id);
      loadConversations();
    }, 8000);
    return () => clearInterval(iv);
  }, [activePartner?.id, user?.id]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activePartner || !user?.id) return;
    setSending(true);
    try {
      await axios.post("/api/messages", {
        sender_id: user.id,
        receiver_id: activePartner.id,
        content: input.trim(),
      });
      setInput("");
      await loadMessages(activePartner.id);
      loadConversations();
    } finally {
      setSending(false);
    }
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

  const roleText = (r: string) =>
    r === "TEACHER" ? "Öğretmen" : r === "ADMIN" ? "Yönetici" : "Öğrenci";

  return (
    <div className="h-[calc(100vh-180px)] min-h-[500px]">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-dark dark:text-white">Mesajlar</h1>
        <p className="text-sm text-gray-500 mt-1">Öğretmen ve öğrenci iletişimi</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] h-full bg-white dark:bg-darkgray rounded-xl shadow-sm border border-border dark:border-darkborder overflow-hidden">
        {/* Konuşma listesi */}
        <aside className="border-r border-border dark:border-darkborder overflow-y-auto">
          <div className="px-4 py-3 border-b border-border dark:border-darkborder">
            <h2 className="text-sm font-semibold text-dark dark:text-white">Kişiler</h2>
          </div>
          {loadingList ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-10 px-4 text-gray-400 text-sm">
              <Icon icon="tabler:message-off" width={32} className="mx-auto mb-2 opacity-40" />
              <p>Henüz mesajlaşabileceğiniz biri yok.</p>
            </div>
          ) : (
            <ul>
              {conversations.map((c) => {
                const active = activePartner?.id === c.partner.id;
                return (
                  <li key={c.partner.id}>
                    <button
                      onClick={() => setActivePartner(c.partner)}
                      className={`w-full flex items-start gap-3 px-4 py-3 border-b border-border dark:border-darkborder hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left ${
                        active ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon icon="tabler:user" className="text-primary" width={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-dark dark:text-white truncate">
                            {c.partner.full_name}
                          </p>
                          {c.unread_count > 0 && (
                            <span className="text-[10px] bg-primary text-white rounded-full px-1.5 min-w-[18px] h-[18px] flex items-center justify-center font-semibold">
                              {c.unread_count}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {c.last_message?.content ?? roleText(c.partner.role)}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        {/* Chat alanı */}
        <section className="flex flex-col min-w-0">
          {activePartner ? (
            <>
              <header className="px-5 py-3 border-b border-border dark:border-darkborder flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon icon="tabler:user" className="text-primary" width={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-dark dark:text-white">
                    {activePartner.full_name}
                  </p>
                  <p className="text-xs text-gray-400">{roleText(activePartner.role)}</p>
                </div>
              </header>

              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-5 space-y-3 bg-gray-50 dark:bg-gray-900"
              >
                {loadingChat ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
                    <Icon icon="tabler:messages" width={40} className="opacity-30 mb-2" />
                    <p>İlk mesajı siz yazın</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const mine = m.sender_id === user?.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex ${mine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                            mine
                              ? "bg-primary text-white rounded-br-md"
                              : "bg-white dark:bg-darkgray border border-border dark:border-darkborder text-dark dark:text-white rounded-bl-md"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{m.content}</p>
                          <p
                            className={`text-[10px] mt-1 ${
                              mine ? "text-white/70" : "text-gray-400"
                            }`}
                          >
                            {formatTime(m.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form
                onSubmit={handleSend}
                className="border-t border-border dark:border-darkborder p-3 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Mesajınızı yazın..."
                  className="flex-1 text-sm border border-border dark:border-darkborder rounded-full px-4 py-2 bg-white dark:bg-darkgray focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primaryemphasis disabled:opacity-50 transition-colors"
                >
                  <Icon icon="tabler:send" width={18} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Icon icon="tabler:messages" width={48} className="opacity-30 mb-2" />
              <p className="text-sm">Sohbet başlatmak için bir kişi seçin.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
