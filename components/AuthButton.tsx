import { signOut } from "@/app/auth/action";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Button } from "./ui/button";

export default async function AuthButton() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex items-center gap-2 md:gap-4">
      <Link href="/">Clients</Link>
      <Link href="/screener">Fund Screener</Link>
      <Link href={`/guide/${user?.id}`}>Guide</Link>
      <Link href="/settings">Settings</Link>

      <form action={signOut}>
        <Button size="sm">Logout</Button>
      </form>
    </div>
  );
}
