interface ProfileType {
  title: string;
  subtitle?: string;
  url: string;
  icon: string;
}

const profileDD: ProfileType[] = [
  {
    title: "Profilim",
    subtitle: "Hesap ayarları",
    icon: "tabler:user",
    url: "/user-profile",
  },
  {
    title: "Mesajlar",
    subtitle: "Sohbet geçmişi",
    icon: "tabler:messages",
    url: "/mesajlar",
  },
];

const Notifications: { title: string; subtitle: string }[] = [];

export { Notifications, profileDD };
