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
  title: "헤아림 HearHim // HEARHIM PROTOCOL",
  description: "인공지능 안면 생리학 기반 심상(心象) & 건강 컨디션, MBTI 및 에니어그램 관계 스캐너",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "헤아림"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <script dangerouslySetInnerHTML={{
          __html: `
            // Prevent Service Worker registry on localhost to avoid developer tool flickering & HMR conflicts
            if ('serviceWorker' in navigator && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/service-worker.js').then(function(reg) {
                  console.log('SW registered with scope: ', reg.scope);
                }).catch(function(err) {
                  console.log('SW registration failed: ', err);
                });
              });
            }
          `
        }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
