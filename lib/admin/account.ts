export type AccountTab = "profile" | "security" | "devices" | "activity" | "settings";

export const accountTabs: {
  id: AccountTab;
  href: string;
  title: string;
  description: string;
}[] = [
  {
    id: "profile",
    href: "/account/profile",
    title: "Profile",
    description: "Your photo, name, and email.",
  },
  {
    id: "security",
    href: "/account/security",
    title: "Security",
    description: "Password, two-factor, and account deletion.",
  },
  {
    id: "devices",
    href: "/account/devices",
    title: "Devices",
    description: "Signed-in devices and sign-in history.",
  },
  {
    id: "activity",
    href: "/account/activity",
    title: "Activity",
    description: "Sign-ins, security and account changes.",
  },
  {
    id: "settings",
    href: "/account/settings",
    title: "Settings",
    description: "Theme and notification preferences.",
  },
];
