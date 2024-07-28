import { createClient } from "@/utils/supabase/server";
import Navbar from "./Navbar";

const LayoutWrapper = async ({ children }: { children: React.ReactNode }) => {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? (
    <div className="flex-1 w-full flex flex-col gap-10 items-center">
      <Navbar />
      <div className="flex-1 w-full flex flex-col px-3">{children}</div>
    </div>
  ) : (
    <>{children}</>
  );
};

export default LayoutWrapper;
