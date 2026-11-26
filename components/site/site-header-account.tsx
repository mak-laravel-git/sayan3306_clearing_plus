"use client";

import {
  LayoutDashboard,
  LogOut,
  MonitorSmartphone,
  Settings,
  Shield,
  UserRound,
} from "lucide-react";
import { useMemo } from "react";

import { HeaderUser } from "@/components/nav/header-user";
import { homeFor } from "@/lib/auth/portals";
import type { UserRole } from "@/types/auth";
import type { UserMenuGroup, UserSummary } from "@/lib/nav";
import { useTransitionController } from "@/components/transitions/transition-provider";

export function SiteHeaderAccount({
  user,
  onLogout,
}: {
  user: UserSummary;
  onLogout: () => void | Promise<void>;
}) {
  const { runTransitionAction } = useTransitionController();
  const menu = useMemo<UserMenuGroup[]>(
    () => [
      {
        label: "Workspace",
        items: [
          { title: "Dashboard", href: homeFor({ role: (user.role as UserRole | null | undefined) ?? null }), icon: LayoutDashboard },
          { title: "Profile", href: "/account/profile", icon: UserRound },
          { title: "Security", href: "/account/security", icon: Shield },
          { title: "Devices", href: "/account/devices", icon: MonitorSmartphone },
          { title: "Settings", href: "/account/settings", icon: Settings },
        ],
      },
      {
        label: "Session",
        items: [
          {
            title: "Log out",
            icon: LogOut,
            variant: "destructive",
            onSelect: () => {
              void runTransitionAction(onLogout);
            },
          },
        ],
      },
    ],
    [onLogout, runTransitionAction, user.role],
  );

  return <HeaderUser user={user} groups={menu} avatarOnly />;
}
