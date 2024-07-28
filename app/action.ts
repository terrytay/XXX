import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const toggleTheme = async (formData: FormData) => {
  "use server";

  const supabase = createClient();

  const toSet = formData.get("switch") === "on" ? false : true;
  const id = formData.get("id");
  console.log(id);
  if (id != "") {
    await supabase
      .from("agents")
      .update({
        dark: toSet,
      })
      .eq("agent_id", id);

    return redirect("/");
  }
};
