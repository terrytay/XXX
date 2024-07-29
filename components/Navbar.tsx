import Image from "next/image";
import AuthButton from "./AuthButton";
import { createClient } from "@/utils/supabase/server";
import { bounceOut } from "@/app/auth/action";
import Link from "next/link";

const Navbar = async () => {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return bounceOut();
  }
  return (
    <div className="w-full print:hidden">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full  flex justify-between items-center p-3 text-sm">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Image src="/logo.jpg" width={34} height={34} alt="logo" />
            </Link>
            <div className="text-xs md:text-sm">
              Hey, {user?.user_metadata.name}!
            </div>
          </div>
          <AuthButton />
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
