import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "@/components/ui/toast";
import { NotificationContainer } from "@/components/ui/notification";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Y Hoc Gia Dinh",
  description: "Healthcare intake platform with form engine, recommendations, and index formulas.",
};

import { Providers } from "@/components/providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${manrope.variable} ${sora.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <Providers>
          {children}
        </Providers>
        <ToastContainer />
        <NotificationContainer />
      </body>
    </html>
  );
}
