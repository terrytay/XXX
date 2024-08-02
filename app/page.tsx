import { SubmitButton } from "../components/submit-button";
import Image from "next/image";
import { signIn } from "./auth/action";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { UserResponse } from "@supabase/supabase-js";

export default async function Login({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  const supabase = createClient();

  const user: UserResponse = await supabase.auth.getUser();

  if (user.data.user) {
    redirect("/clients");
  }
  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center items-center gap-2 space-y-10">
      {/* <Link
        href="/"
        className="absolute left-8 top-8 py-2 px-4 rounded-md no-underline text-foreground bg-btn-background hover:bg-btn-background-hover flex items-center group text-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>{" "}
        Back
      </Link> */}

      <Image
        src="/logo.jpg"
        width={512}
        height={128}
        alt="logo"
        className="rounded-full"
      />

      <form className="flex flex-col w-full justify-center gap-2 text-foreground">
        <SubmitButton
          formAction={signIn}
          className="bg-green-700 rounded-md px-4 py-2 text-foreground mb-2"
          pendingText="Signing In..."
        >
          Sign In
        </SubmitButton>
      </form>
    </div>
  );
}
