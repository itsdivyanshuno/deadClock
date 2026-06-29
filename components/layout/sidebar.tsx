"use client";

import { Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  CheckSquare,
  Target,
  Settings2,
  PanelLeftClose,
  PanelLeftOpen,
  Clock,
  TrendingUp,
  BarChart3,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { View } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export type { View } from "@/lib/types";

/* ── Navigation data ─────────────────────────────────────────────── */

interface NavItem {
  id: View;
  label: string;
  icon: React.ComponentType<{ strokeWidth?: number; className?: string }>;
}

const MAIN_NAV: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: Target },
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "goals", label: "Goals", icon: Target },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "heatmap", label: "Activity", icon: TrendingUp },
  { id: "reflection", label: "Reflect", icon: Moon },
];

const FOOTER_NAV: NavItem[] = [
  { id: "settings", label: "Settings", icon: Settings2 },
];

/* ── Props ───────────────────────────────────────────────────────── */

interface SidebarProps {
  view: View;
  onViewChange: (v: View) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

/* ── TooltipNavItem ───────────────────────────────────────────────── */

function TooltipNavItem({
  item,
  active,
  onClick,
  collapsed,
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
  collapsed: boolean;
}) {
  const content = (
    <button
      type="button"
      onClick={onClick}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
      className={cn(
        collapsed
          ? "flex items-center justify-center w-full px-2.5 py-2 rounded-lg"
          : "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium",
        "transition-colors duration-150 cursor-pointer",
        active
          ? "bg-primary/10 text-primary"
          : "text-text-muted hover:text-text hover:bg-border-light"
      )}
    >
      <item.icon
        className={cn(
          collapsed ? "h-5 w-5" : "h-[18px] w-[18px]",
          "shrink-0",
          active && "text-primary"
        )}
        strokeWidth={active ? 2.5 : 2}
      />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </button>
  );

  if (collapsed) {
    return (
      <span className="group relative inline-flex">
        {content}
        <span className="pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 hidden group-hover:flex">
          <span className="rounded-md bg-[#1c1917] px-2.5 py-1.5 text-xs font-medium text-white shadow-lg whitespace-nowrap">
            {item.label}
          </span>
        </span>
      </span>
    );
  }

  return content;
}

/* ── Sidebar ─────────────────────────────────────────────────────── */

export function Sidebar({
  view,
  onViewChange,
  darkMode,
  onToggleDarkMode,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const go = (id: View) => onViewChange(id);

  return (
    <motion.aside
      layout
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "h-dvh border-r border-border bg-sidebar flex flex-col shrink-0 overflow-hidden",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
      aria-label="Main navigation"
    >
      {/* Brand header */}
      <div
        className={cn(
          "flex items-center h-14 shrink-0",
          collapsed ? "justify-center px-2" : "gap-2.5 px-4"
        )}
      >
        <div
          className={cn(
            "rounded-xl flex items-center justify-center shrink-0",
            "bg-gradient-to-br from-primary via-primary to-text shadow-md"
          )}
        >
          <Clock
            className={cn("text-white", collapsed ? "h-5 w-5" : "h-4 w-4")}
            strokeWidth={2}
          />
        </div>

        {/* Brand name + subtitle — animated fade on collapse */}
        <div className="overflow-hidden whitespace-nowrap">
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="ml-2"
              >
                <h1 className="font-bold text-[15px] text-text leading-none tracking-tight">
                  dead<span className="text-accent">Clock</span>
                </h1>
                <p className="text-[10px] text-text-muted mt-0.5 font-medium">
                  Last-minute life saver
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse toggle */}
        {onToggleCollapse && !collapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Collapse sidebar"
            className="ml-auto h-7 w-7 rounded-md flex items-center justify-center text-text-muted hover:text-text hover:bg-border-light transition-colors"
          >
            <PanelLeftClose className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Expand button (collapsed mode, outside scroll area) */}
      {collapsed && onToggleCollapse && (
        <motion.button
          type="button"
          onClick={onToggleCollapse}
          aria-label="Expand sidebar"
          className="absolute -right-2.5 top-5 h-6 w-6 rounded-full bg-surface border border-border flex items-center justify-center shadow-sm text-text-muted hover:text-text z-20"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileTap={{ scale: 0.85 }}
        >
          <PanelLeftOpen className="h-3 w-3" />
        </motion.button>
      )}

      {/* Scrollable navigation area */}
      <ScrollArea className="flex-1">
        <div
          className={cn(
            "flex flex-col gap-0.5",
            collapsed ? "px-2 py-2" : "px-3 py-2"
          )}
        >
          {MAIN_NAV.map((item) => (
            <TooltipNavItem
              key={item.id}
              item={item}
              active={view === item.id}
              onClick={() => go(item.id)}
              collapsed={collapsed}
            />
          ))}

          <div className="mx-4 my-3 border-t border-border" />

          {FOOTER_NAV.map((item) => (
            <TooltipNavItem
              key={item.id}
              item={item}
              active={view === item.id}
              onClick={() => go(item.id)}
              collapsed={collapsed}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Bottom: user + dark mode */}
      <div className="mt-auto border-t border-border">
        <button
          type="button"
          onClick={onToggleDarkMode}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          className={cn(
            "flex items-center gap-3 w-full px-4 py-2.5 hover:bg-border-light transition-colors text-left cursor-pointer",
            collapsed && "justify-center px-2"
          )}
        >
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarFallback className="bg-primary text-white text-[10px] font-bold">
              DU
            </AvatarFallback>
          </Avatar>
          <div className="overflow-hidden whitespace-nowrap">
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <p className="text-[12px] font-medium text-text truncate">
                    Divyansh
                  </p>
                  <p className="text-[10px] text-text-muted">Pro Member</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-[11px] text-text-muted ml-auto"
            >
              {darkMode ? "☀️" : "🌙"}
            </motion.span>
          )}
          {collapsed && (
            <span className="text-[11px] text-text-muted">
              {darkMode ? "☀️" : "🌙"}
            </span>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
