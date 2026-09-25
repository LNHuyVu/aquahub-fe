import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { SocketProvider } from "@/contexts/socket-context";
import { ToastProvider } from "@/components/ui/toast-provider";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import ScrollToTop from "@/components/ui/scroll-to-top";
import FloatingChatWidget from "@/components/ui/floating-chat-widget";


const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-be-vietnam",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://aquahub.vn'),
  title: {
    default: "AquaHub — Nền Tảng Cá Cảnh, Sàn Mua Bán & Nhật Ký Hồ Cá Số #1 Việt Nam",
    template: "%s | AquaHub - Cá Cảnh & Thủy Sinh",
  },
  description: "Cơ sở dữ liệu 1.150+ loài cá cảnh, Sàn mua bán thiết bị sinh vật cảnh, cẩm nang chăm sóc cá và công cụ tính toán thủy sinh hàng đầu Việt Nam.",
  keywords: [
    "cá cảnh",
    "thủy sinh",
    "sàn mua bán cá cảnh",
    "tra cứu loài cá",
    "cẩm nang cá cảnh",
    "nhật ký hồ cá",
    "công cụ thủy sinh",
    "cá betta",
    "cá koi",
    "cá guppy",
    "tép cảnh",
  ],
  authors: [{ name: "AquaHub Team" }],
  creator: "AquaHub",
  publisher: "AquaHub Việt Nam",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://aquahub.vn",
    title: "AquaHub — Nền Tảng Cá Cảnh & Thủy Sinh Số 1 Việt Nam",
    description: "Khám phá thế giới cá cảnh, chợ sinh vật cảnh, cẩm nang chăm sóc và quản lý nhật ký hồ cá chuyên nghiệp.",
    siteName: "AquaHub",
    images: [
      {
        url: "/logo/logo.png",
        width: 800,
        height: 800,
        alt: "AquaHub Logo - Nền tảng cá cảnh Việt Nam",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AquaHub — Nền Tảng Cá Cảnh & Thủy Sinh Số 1 Việt Nam",
    description: "Cơ sở dữ liệu loài cá, sàn mua bán, cẩm nang chăm sóc cá cảnh hàng đầu.",
    images: ["/logo/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/logo/logo.png",
    shortcut: "/logo/logo.png",
    apple: "/logo/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="light" suppressHydrationWarning>
      <body className={`${beVietnamPro.className} min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased`} suppressHydrationWarning>
        <Script
          id="json-ld-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "AquaHub",
              "url": "https://aquahub.vn",
              "description": "Nền tảng tra cứu cá cảnh, sàn mua bán sinh vật cảnh và nhật ký hồ cá số hàng đầu Việt Nam",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://aquahub.vn/ca-canh?search={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
        <AuthProvider>
          <SocketProvider>
            <ToastProvider>
              <Header />
              <main className="flex-1 pb-14 md:pb-0">{children}</main>
              <Footer />
              <MobileBottomNav />
              <ScrollToTop />
              <FloatingChatWidget />
            </ToastProvider>

          </SocketProvider>
        </AuthProvider>

      </body>
    </html>
  );
}
