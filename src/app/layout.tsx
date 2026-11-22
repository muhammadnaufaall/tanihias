import type { Metadata } from "next";
import { Bricolage_Grotesque, Kalam, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const kalam = Kalam({
  variable: "--font-kalam",
  subsets: ["latin"],
  weight: "700",
});

export const metadata: Metadata = {
  title: {
    default: "Tanihias · Tanaman hias langsung dari petani Cihideung",
    template: "%s · Tanihias",
  },
  description:
    "Marketplace tanaman hias yang menghubungkan pembeli langsung dengan petani Desa Cihideung, Kabupaten Bandung Barat.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${jakarta.variable} ${bricolage.variable} ${kalam.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster theme="light" position="top-center" />
      </body>
    </html>
  );
}
