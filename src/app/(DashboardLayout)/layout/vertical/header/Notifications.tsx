"use client";
import { Icon } from "@iconify/react";
import Link from "next/link";
import React, { useContext, useEffect, useState } from "react";
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

const Notifications = () => {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    const load = () =>
      axios
        .get(`/api/messages/conversations?userId=${user.id}`)
        .then((r) => setConversations(r.data.data ?? []))
        .catch(() => {});
    load();
    const iv = setInterval(load, 15000);
    return () => clearInterval(iv);
  }, [user?.id]);

  const unreadTotal = conversations.reduce((t, c) => t + c.unread_count, 0);
  const unreadOnly = conversations.filter((c) => c.unread_count > 0);

  const formatWhen = (iso: string) => {
    const d = new Date(iso);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return "az önce";
    if (diff < 3600) return `${Math.floor(diff / 60)} dk`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} sa`;
    return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
  };

  return (
    <div className="relative group/menu px-15">
      <Dropdown
        label=""
        className="w-screen sm:w-[320px] py-5 rounded-sm custom-dropdown"
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
            <span className="text-xs text-primary font-medium">{unreadTotal} okunmamış</span>
          )}
        </div>

        <SimpleBar className="max-h-80 mt-3">
          {unreadOnly.length === 0 ? (
            <div className="px-5 py-10 text-center text-gray-400">
              <Icon icon="tabler:bell-off" width={26} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Yeni bildirim yok.</p>
            </div>
          ) : (
            unreadOnly.map((c) => (
              <DropdownItem
                as={Link}
                href="/mesajlar"
                className="px-5 py-2 flex items-start gap-3 bg-hover group/link w-full"
                key={c.partner.id}
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon icon="tabler:message" className="text-primary" width={16} />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="text-sm font-semibold text-dark dark:text-white truncate">
                      {c.partner.full_name}
                    </h5>
                    {c.last_message && (
                      <span className="text-[10px] text-gray-400 flex-shrink-0">
                        {formatWhen(c.last_message.created_at)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {c.last_message?.content ?? "Yeni mesaj"}
                  </p>
                </div>
              </DropdownItem>
            ))
          )}
        </SimpleBar>

        <div className="pt-4 px-5">
          <Button
            as={Link}
            href="/mesajlar"
            color="primary"
            className="w-full border border-primary text-primary hover:bg-primary hover:text-white rounded-md"
            pill
            outline
          >
            Tüm Mesajları Gör
          </Button>
        </div>
      </Dropdown>
    </div>
  );
};

export default Notifications;
