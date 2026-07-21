import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgaLife — Там, где живёт округ",
  description:
    "Цифровая площадка для жителей Агинского Бурятского округа: афиша мероприятий округа.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <span className="text-lg font-bold text-blue-700">AgaLife</span>
            <nav className="flex gap-4 text-sm text-gray-500">
              <span className="cursor-not-allowed" title="Скоро">
                Барахолка
              </span>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-gray-200 bg-white py-6 text-center text-sm text-gray-500">
          AgaLife — «Там, где живёт округ»
        </footer>
      </body>
    </html>
  );
}
