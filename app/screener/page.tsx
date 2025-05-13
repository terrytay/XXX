import { createClient } from "@/utils/supabase/server";
import { bounceOut } from "../auth/action";
import { UserResponse } from "@supabase/supabase-js";

export default async function Page() {
  const supabase = createClient();
  const user: UserResponse = await supabase.auth.getUser();

  if (!user.data.user) {
    return await bounceOut();
  }
  return (
    <iframe
      id="greateastern"
      src="https://digital.feprecisionplus.com/greateasternlife"
      className="h-screen overflow-hidden"
    ></iframe>
  );
}
