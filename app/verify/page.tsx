import { createClient } from "@/utils/supabase/server";
import React from "react";

const Verify = async () => {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (
    <section className="flex min-h-screen justify-center items-center">
      <div className="">
        Welcome {user?.user_metadata.name.split(" ")[0]}, please notify admin
        for access.
      </div>
    </section>
  );
};

export default Verify;
