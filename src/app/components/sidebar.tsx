"use client";

import {
  LayoutDashboard,
  FileSpreadsheet,
  FolderEdit,
  Calculator,
  Tag,
  Users2,
  KeyRound,
  Settings,
  ArrowLeftToLine,
} from "lucide-react";
import SidebarItem from "./sidebar-item";
import { logout } from "../actions/auth";
import { useUser } from "../hooks/useUser";

export default function Sidebar() {
  const { user: userData, loading } = useUser();

  const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: FileSpreadsheet, label: "Invoices", href: "/invoices" },
    // { icon: FolderEdit, label: "Projects", href: "/project-management" },
    { icon: Calculator, label: "Cost Centers", href: "/cost-center" },
    { icon: Tag, label: "Expense Type", href: "/expense-type" },
  ];

  const adminItems = [
    // { icon: Users2, label: "Clients", href: "/clients" },
    { icon: KeyRound, label: "API Keys", href: "/api-keys" },
    { icon: Settings, label: "Settings", href: "/setting" },
    // The logout item does not have an href, which is correct.
    { icon: ArrowLeftToLine, label: "Logout" },
  ];

  const getUserInitials = (name: string) => {
    if (!name || name === "Loading...") return "?";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");
  };

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col shrink-0">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
            {loading ? (
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              getUserInitials(userData.userName)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="font-semibold text-sm text-gray-900 truncate"
              title={userData.userName}
            >
              {loading ? "Loading..." : userData.userName || "User"}
            </div>
            <div
              className="text-xs text-gray-600 truncate"
              title={userData.userEmail}
            >
              {loading ? "..." : userData.userEmail || "No email"}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
            Workspace
          </div>
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <SidebarItem key={item.label} {...item} />
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
            Administration
          </div>
          <div className="space-y-1">
            {adminItems.map((item) => {
              if (item.label === "Logout") {
                return (
                  <form action={logout} key={item.label}>
                    <button type="submit" className="w-full text-left">
                      <SidebarItem icon={item.icon} label={item.label} />
                    </button>
                  </form>
                );
              }
              return <SidebarItem key={item.label} {...item} />;
            })}
          </div>
        </div>
      </nav>
    </aside>
  );
}
