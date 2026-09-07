import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { ToastProvider } from "@/components/ui/toast-provider";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "AquaHub — Nơi quản lý hồ cá và kết nối cộng đồng cá cảnh",
  description: "Cơ sở dữ liệu cá cảnh, nhật ký hồ cá, công cụ tính dung tích và cộng đồng hỏi đáp cá cảnh hàng đầu Việt Nam.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="light">
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased`}>
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
        <AuthProvider>
          <ToastProvider>
            <Header />
            <main className="flex-1 pb-14 md:pb-0">{children}</main>
            <Footer />
            <MobileBottomNav />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

