import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const signIn = async () => {
  "use server";

  const origin = headers().get("origin");
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return redirect("/login?message=Could not authenticate user");
  }

  if (data) {
    redirect(data.url);
  }

  // return redirect("/protected");
};

export const signOut = async () => {
  "use server";

  const supabase = createClient();
  await supabase.auth.signOut();
  return redirect("/");
};

export const bounceOut = async () => {
  "use server";

  return redirect("/");
};
