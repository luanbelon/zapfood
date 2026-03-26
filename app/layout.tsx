import { CartProvider } from "@/components/cart/CartProvider";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getStoreSettings } from "@/lib/store-settings-repo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  const name = settings.storeName;
  return {
    title: { default: name, template: `%s · ${name}` },
    description: "Cardápio digital. Peça pelo WhatsApp.",
    appleWebApp: { capable: true, title: name, statusBarStyle: "default" },
  };
}

export async function generateViewport(): Promise<Viewport> {
  const settings = await getStoreSettings();
  return { themeColor: settings.primaryColor };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen font-sans`}
      >
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
