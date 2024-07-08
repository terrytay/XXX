import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const uploadFiles = async (files: File[]) => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (files.length === 0) {
    return redirect("/upload?message=Please select a file");
  } else {
    if (user) {
      console.log(files[0]);
      const { data, error } = await supabase.storage
        .from(process.env.BUCKET_NAME!)
        .upload(user.id, files[0], {
          contentType: "json",
          upsert: true,
        });
      if (error) {
        return redirect("/upload?message=Could not upload file");
      }
    }
    return redirect("/");
  }

  // return redirect("/protected");
};
