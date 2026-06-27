/**
 * @module app/layout
 * @description Root layout for the Deadline application.
 *
 * Responsibilities:
 *  - Provide global `<html>` and `<body>` wrappers consumed by every page.
 *  - Set SEO metadata (title, description) injected into the `<head>`.
 *  - Import the global stylesheet (Tailwind v4 CSS + custom design tokens).
 *
 * Notes:
 *  - The `antialiased` Tailwind class was removed here because it is a
 *    Tailwind CSS v3 utility that no longer exists in v4. Font smoothing
 *    is handled explicitly in `globals.css` instead.
 */

import type { Metadata } from "next";
import "./globals.css";

/**
 * Default SEO metadata applied to every route in the application.
 * Individual pages can override these via their own `metadata` export.
 */
export const metadata: Metadata = {
  title: "Deadline — AI Productivity Companion",
  description: "AI-powered task management for students and professionals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
