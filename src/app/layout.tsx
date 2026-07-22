import type { Metadata } from "next";
import { Nunito, PT_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-display",
  subsets: ["cyrillic", "latin"],
  weight: ["700", "800"],
});

const ptSans = PT_Sans({
  variable: "--font-body",
  subsets: ["cyrillic", "latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "AgaLife — Там, где живёт округ",
  description:
    "Цифровая площадка для жителей Агинского Бурятского округа: афиша мероприятий, события и жизнь округа.",
  keywords: [
    "Агинский Бурятский округ",
    "Агинское",
    "афиша Агинское",
    "мероприятия Забайкальский край",
    "AgaLife",
  ],
  openGraph: {
    title: "AgaLife — Там, где живёт округ",
    description:
      "Цифровая площадка для жителей Агинского Бурятского округа: афиша мероприятий, события и жизнь округа.",
    url: SITE_URL,
    siteName: "AgaLife",
    locale: "ru_RU",
    type: "website",
  },
  verification: {
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${nunito.variable} ${ptSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-tint text-ink font-sans">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center px-4 py-4">
            <span className="font-display text-lg font-extrabold text-brand-deep">
              AgaLife
            </span>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
          AgaLife — «Там, где живёт округ»
        </footer>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
