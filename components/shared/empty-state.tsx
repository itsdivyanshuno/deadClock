"use client";

import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action, secondaryAction }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex flex-col items-center justify-center h-full text-center px-6"
    >
      {/* Icon with subtle floating animation and gradient background */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="h-16 w-16 rounded-2xl bg-gradient-to-br from-border-light to-border flex items-center justify-center mb-5 shadow-sm"
      >
        <Icon className="h-7 w-7 text-text-muted" strokeWidth={1.5} />
      </motion.div>

      <h3 className="display-font text-[15px] text-text mb-1.5">{title}</h3>
      <p className="text-sm text-text-secondary max-w-xs leading-relaxed mb-6">
        {description}
      </p>

      <div className="flex gap-3">
        {action && (
          <button
            onClick={action.onClick}
            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-text transition-colors"
          >
            {action.label}
          </button>
        )}
        {secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            className="px-4 py-2 border border-border text-sm font-medium rounded-lg text-text-secondary hover:bg-border-light transition-colors"
          >
            {secondaryAction.label}
          </button>
        )}
      </div>
    </motion.div>
  );
}
