import { signOut } from "@/app/auth/action";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Button } from "./ui/button";

import { toggleTheme } from "@/app/action";
import ToggleThemeComponent from "./ui/toggleThemeComponent";

export default async function AuthButton() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("agents")
    .select()
    .eq("agent_id", user?.id);

  const dark: boolean = data?.at(0).dark || false;

  return (
    <div className="flex items-center gap-2 md:gap-4">
      <Link href="/">Home</Link>
      <Link href={`/guide/${user?.id}`}>Guide</Link>
      <ToggleThemeComponent
        dark={dark}
        toggleTheme={toggleTheme}
        id={user?.id || ""}
      />

      <form action={signOut}>
        <Button size="sm">Logout</Button>
      </form>
    </div>
  );
}
