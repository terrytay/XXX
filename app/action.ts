import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const toggleTheme = async (formData: FormData) => {
  "use server";

  const supabase = createClient();

  const toSet = formData.get("switch") === "on" ? false : true;
  const id = formData.get("id");

  if (id != "") {
    await supabase
      .from("agents")
      .update({
        dark: toSet,
      })
      .eq("agent_id", id);

    revalidatePath("/");
  }
};

export const toggleAdminView = async (formData: FormData) => {
  "use server";

  const supabase = createClient();

  const toSet = formData.get("switch") === "on" ? false : true;
  const id = formData.get("id");

  if (id === "364c9a6d-ba68-49d7-a227-3692346722c1") {
    await supabase
      .from("agents")
      .update({
        adminView: toSet,
      })
      .eq("agent_id", id);

    revalidatePath("/");
  }
};

export const toggleBonus = async (formData: FormData) => {
  "use server";

  const supabase = createClient();

  const toSet = formData.get("switch") === "on" ? false : true;
  const id = formData.get("id");

  if (id != "") {
    await supabase
      .from("agents")
      .update({
        include: toSet,
      })
      .eq("agent_id", id);

    revalidatePath("/");
  }
};
