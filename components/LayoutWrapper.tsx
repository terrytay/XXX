import { createClient } from "@/utils/supabase/server";
import Navbar from "./Navbar";
import Verify from "@/app/verify/page";
import { redirect } from "next/navigation";

const LayoutWrapper = async ({ children }: { children: React.ReactNode }) => {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("agents")
    .select()
    .eq("agent_id", user?.id);

  if (user && data!.length === 0) {
    redirect(
      "https://www.google.com/search?q=cats&rlz=1C5CHFA_enSG1092SG1092&oq=cats&gs_lcrp=EgZjaHJvbWUqGAgAEAAYQxiDARjjAhixAxjJAxiABBiKBTIYCAAQABhDGIMBGOMCGLEDGMkDGIAEGIoFMhUIARAuGEMYgwEYsQMYyQMYgAQYigUyCggCEAAYsQMYgAQyBwgDEAAYgAQyDQgEEAAYkgMYgAQYigUyBwgFEC4YgAQyBwgGEC4YgAQyBggHEEUYPdIBCDEwMTNqMGo3qAIAsAIA&sourceid=chrome&ie=UTF-8"
    );
  }

  return user ? (
    <div className="flex-1 w-full flex flex-col gap-10 items-center">
      <Navbar />
      <div className="flex-1 w-full flex flex-col px-0">{children}</div>
    </div>
  ) : (
    <>{children}</>
  );
};

export default LayoutWrapper;
