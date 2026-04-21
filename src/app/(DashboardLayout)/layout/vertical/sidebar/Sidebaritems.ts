export interface ChildItem {
  id?: number | string;
  name?: string;
  icon?: any;
  children?: ChildItem[];
  item?: any;
  url?: any;
  color?: string;
  disabled?: boolean;
  subtitle?: string;
  badge?: boolean;
  badgeType?: string;
}

export interface MenuItem {
  heading?: string;
  name?: string;
  icon?: any;
  id?: number;
  to?: string;
  items?: MenuItem[];
  children?: ChildItem[];
  url?: any;
  disabled?: boolean;
  subtitle?: string;
  badgeType?: string;
  badge?: boolean;
}

import { uniqueId } from "lodash";

export const StudentSidebar: MenuItem[] = [
  {
    heading: "Genel",
    children: [
      { name: "Ana Sayfa", icon: "tabler:layout-dashboard", id: uniqueId(), url: "/panel" },
    ],
  },
  {
    heading: "Eğitimim",
    children: [
      { name: "Derslerim", icon: "tabler:video", id: uniqueId(), url: "/derslerim" },
      { name: "Paketim", icon: "tabler:package", id: uniqueId(), url: "/paketim" },
      { name: "Satın Alma Geçmişi", icon: "tabler:receipt", id: uniqueId(), url: "/satin-alma-gecmisi" },
    ],
  },
  {
    heading: "İletişim",
    children: [
      { name: "Mesajlar", icon: "tabler:messages", id: uniqueId(), url: "/mesajlar" },
      { name: "Notlarım", icon: "tabler:notes", id: uniqueId(), url: "/notlarim" },
    ],
  },
  {
    heading: "Hesap",
    children: [
      { name: "Profilim", icon: "tabler:user-circle", id: uniqueId(), url: "/user-profile" },
    ],
  },
];

export const TeacherSidebar: MenuItem[] = [
  {
    heading: "Genel",
    children: [
      { name: "Dashboard", icon: "tabler:layout-dashboard", id: uniqueId(), url: "/panel" },
    ],
  },
  {
    heading: "Öğrenciler",
    children: [
      { name: "Öğrenci Listesi", icon: "tabler:users", id: uniqueId(), url: "/ogretmen/ogrenciler" },
      { name: "Ders Yönetimi", icon: "tabler:calendar-event", id: uniqueId(), url: "/ogretmen/dersler" },
    ],
  },
  {
    heading: "İçerik",
    children: [
      { name: "Öğrenci Notları", icon: "tabler:notes", id: uniqueId(), url: "/ogretmen/notlar" },
      { name: "Mesajlar", icon: "tabler:messages", id: uniqueId(), url: "/mesajlar" },
    ],
  },
  {
    heading: "Hesap",
    children: [
      { name: "Profilim", icon: "tabler:user-circle", id: uniqueId(), url: "/user-profile" },
    ],
  },
];

export const AdminSidebar: MenuItem[] = [
  {
    heading: "Genel",
    children: [
      { name: "Dashboard", icon: "tabler:layout-dashboard", id: uniqueId(), url: "/panel" },
    ],
  },
  {
    heading: "Kullanıcılar",
    children: [
      { name: "Öğrenciler", icon: "tabler:users", id: uniqueId(), url: "/admin/ogrenciler" },
      { name: "Öğretmenler", icon: "tabler:school", id: uniqueId(), url: "/admin/ogretmenler" },
    ],
  },
  {
    heading: "Paketler",
    children: [
      { name: "Paket Yönetimi", icon: "tabler:package", id: uniqueId(), url: "/admin/paketler" },
    ],
  },
  {
    heading: "İletişim",
    children: [
      { name: "Mesajlar", icon: "tabler:messages", id: uniqueId(), url: "/mesajlar" },
    ],
  },
  {
    heading: "Hesap",
    children: [
      { name: "Profilim", icon: "tabler:user-circle", id: uniqueId(), url: "/user-profile" },
    ],
  },
];

const SidebarContent: MenuItem[] = StudentSidebar;
export default SidebarContent;
