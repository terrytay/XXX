import { GeistSans } from "geist/font/sans";
import "./globals.css";
import Footer from "@/components/Footer";
import LayoutWrapper from "@/components/LayoutWrapper";
import { createClient } from "@/utils/supabase/server";
import { Suspense } from "react";
import { Progress } from "@/components/ui/progress";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Meow",
  description: "Client Investment Tracker",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("agents")
    .select()
    .eq("agent_id", user?.id);
  return (
    <html
      lang="en"
      className={`scrollbar-hide ${data?.at(0)?.dark ? "dark" : ""}`}
    >
      <body className="">
        <main className="min-h-screen flex flex-col items-center">
          <Suspense
            key={Math.random()}
            fallback={
              <div className="absolute mt-0 h-full w-1/2 flex items-center justify-center">
                <Progress value={80} />
              </div>
            }
          >
            <LayoutWrapper>{children}</LayoutWrapper>
          </Suspense>
        </main>
      </body>
    </html>
  );
}
