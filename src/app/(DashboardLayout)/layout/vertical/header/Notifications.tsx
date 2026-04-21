"use client";
import { Icon } from "@iconify/react";
import Link from "next/link";
import React, { useContext, useEffect, useMemo, useState } from "react";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import { Button, Dropdown, DropdownItem } from "flowbite-react";
import AuthContext from "@/app/context/AuthContext";
import axios from "axios";

interface Conversation {
  partner: { id: string; full_name: string; role: string };
  last_message: { content: string; created_at: string; sender_id: string } | null;
  unread_count: number;
}

interface DiscoveryNotification {
  id: number;
  type: "DISCOVERY_COMMENT" | "DISCOVERY_LIKE";
  post_id: number | null;
  comment_id: number | null;
  read_at: string | null;
  created_at: string;
  actor: { id: string; full_name: string; avatar_url: string | null; role: string };
}

type FeedItem =
  | {
      kind: "message";
      key: string;
      href: string;
      created_at: string;
      icon: string;
      iconBg: string;
      title: string;
      body: string;
      unread: number;
    }
  | {
      kind: "discovery";
      key: string;
      href: string;
      created_at: string;
      icon: string;
      iconBg: string;
      title: string;
      body: string;
      unread: number;
      notifId: number;
    };

const Notifications = () => {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [discovery, setDiscovery] = useState<DiscoveryNotification[]>([]);

  const load = async (uid: string) => {
    try {
      const [c, d] = await Promise.all([
        axios.get(`/api/messages/conversations?userId=${uid}`).then((r) => r.data.data ?? []),
        axios.get(`/api/notifications?userId=${uid}`).then((r) => r.data.data ?? []),
      ]);
      setConversations(c);
      setDiscovery(d);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    load(user.id);
    const iv = setInterval(() => load(user.id), 15000);
    return () => clearInterval(iv);
  }, [user?.id]);

  const markAllRead = async () => {
    if (!user?.id) return;
    try {
      await axios.patch(`/api/notifications`, { user_id: user.id });
      setDiscovery((prev) =>
        prev.map((n) => (n.read_at ? n : { ...n, read_at: new Date().toISOString() })),
      );
    } catch {
      /* ignore */
    }
  };

  const formatWhen = (iso: string) => {
    const d = new Date(iso);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return "az önce";
    if (diff < 3600) return `${Math.floor(diff / 60)} dk`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} sa`;
    return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
  };

  const feed: FeedItem[] = useMemo(() => {
    const msgs: FeedItem[] = conversations
      .filter((c) => c.unread_count > 0)
      .map((c) => ({
        kind: "message",
        key: `m-${c.partner.id}`,
        href: "/mesajlar",
        created_at: c.last_message?.created_at ?? new Date(0).toISOString(),
        icon: "tabler:message",
        iconBg: "bg-primary/10 text-primary",
        title: c.partner.full_name,
        body: c.last_message?.content ?? "Yeni mesaj",
        unread: c.unread_count,
      }));

    const discs: FeedItem[] = discovery
      .filter((n) => !n.read_at)
      .map((n) => ({
        kind: "discovery",
        key: `d-${n.id}`,
        href: n.post_id ? `/kesfet/${n.post_id}` : "/kesfet",
        created_at: n.created_at,
        icon: n.type === "DISCOVERY_COMMENT" ? "tabler:message-circle" : "tabler:heart-filled",
        iconBg:
          n.type === "DISCOVERY_COMMENT"
            ? "bg-info/10 text-info"
            : "bg-error/10 text-error",
        title: n.actor.full_name,
        body:
          n.type === "DISCOVERY_COMMENT"
            ? "gönderine yorum yaptı"
            : "gönderini beğendi",
        unread: 1,
        notifId: n.id,
      }));

    return [...msgs, ...discs].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [conversations, discovery]);

  const unreadTotal = feed.reduce((t, i) => t + i.unread, 0);

  return (
    <div className="relative group/menu px-15">
      <Dropdown
        label=""
        className="w-screen sm:w-[340px] py-5 rounded-sm custom-dropdown"
        dismissOnClick={false}
        renderTrigger={() => (
          <div className="relative">
            <span className="relative after:absolute after:w-10 after:h-10 after:rounded-full hover:text-primary after:-top-1/2 hover:after:bg-lightprimary text-link dark:text-darklink rounded-full flex justify-center items-center cursor-pointer group-hover/menu:after:bg-lightprimary group-hover/menu:text-primary">
              <Icon icon="tabler:bell-ringing" height={20} />
            </span>
            {unreadTotal > 0 && (
              <span className="rounded-full absolute -end-[6px] -top-[5px] min-w-[16px] h-4 px-1 text-[10px] bg-primary text-white flex justify-center items-center font-semibold">
                {unreadTotal > 9 ? "9+" : unreadTotal}
              </span>
            )}
          </div>
        )}
      >
        <div className="flex items-center px-5 justify-between">
          <h3 className="mb-0 text-base font-semibold text-ld">Bildirimler</h3>
          {unreadTotal > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-primary font-medium hover:underline"
            >
              Tümünü okundu işaretle
            </button>
          )}
        </div>

        <SimpleBar className="max-h-80 mt-3">
          {feed.length === 0 ? (
            <div className="px-5 py-10 text-center text-gray-400">
              <Icon icon="tabler:bell-off" width={26} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Yeni bildirim yok.</p>
            </div>
          ) : (
            feed.map((item) => (
              <DropdownItem
                as={Link}
                href={item.href}
                className="px-5 py-2 flex items-start gap-3 bg-hover group/link w-full"
                key={item.key}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${item.iconBg}`}
                >
                  <Icon icon={item.icon} width={16} />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="text-sm font-semibold text-dark dark:text-white truncate">
                      {item.title}
                    </h5>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">
                      {formatWhen(item.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{item.body}</p>
                </div>
              </DropdownItem>
            ))
          )}
        </SimpleBar>

        <div className="pt-4 px-5 flex gap-2">
          <Button
            as={Link}
            href="/mesajlar"
            color="primary"
            className="flex-1 border border-primary text-primary hover:bg-primary hover:text-white rounded-md"
            pill
            outline
          >
            Mesajlar
          </Button>
          <Button
            as={Link}
            href="/kesfet"
            color="primary"
            className="flex-1 border border-primary text-primary hover:bg-primary hover:text-white rounded-md"
            pill
            outline
          >
            Keşfet
          </Button>
        </div>
      </Dropdown>
    </div>
  );
};

export default Notifications;
