import { GeistSans } from "geist/font/sans";
import "./globals.css";
import Footer from "@/components/Footer";
import LayoutWrapper from "@/components/LayoutWrapper";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "FinMeister",
  description: "Client Investment Tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body className="bg-background text-foreground">
        <main className="min-h-screen flex flex-col items-center">
          <LayoutWrapper>{children}</LayoutWrapper>
          <Footer />
        </main>
      </body>
    </html>
  );
}
