import type { Metadata, Viewport } from "next";

import { messages } from "@/config/messages";
import { site } from "@/config/site";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { iranSans } from "./font";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: site.name,
    template: `%s | ${site.shortName}`,
  },
  description: messages.app.description,
  applicationName: site.name,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: site.shortName,
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

/** `themeColor` tints the browser chrome and the installed app's status bar. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ff6b1a",
};

/**
 * `lang` and `dir` are set here, once. Every layout below inherits them, so no
 * component has to think about text direction again.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" className={`${iranSans.variable} h-full antialiased`}>
      <body className="min-h-dvh font-sans">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
