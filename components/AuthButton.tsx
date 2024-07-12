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
    <div className="flex items-center gap-4">
      <Link href="/">Home</Link>
      <Link href={`/guide/${user?.id}`}>Guide</Link>
      <form action={signOut}>
        <Button size="sm">Logout</Button>
      </form>
    </div>
  );
}
