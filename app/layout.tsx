import type { Metadata } from "next";

import { messages } from "@/config/messages";
import { site } from "@/config/site";
import { iranSans } from "./font";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: site.name,
    template: `%s | ${site.shortName}`,
  },
  description: messages.app.description,
  applicationName: site.name,
};

/**
 * `lang` and `dir` are set here, once. Every layout below inherits them, so no
 * component has to think about text direction again.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" className={`${iranSans.variable} h-full antialiased`}>
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
