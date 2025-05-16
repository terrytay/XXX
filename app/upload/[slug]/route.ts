import { Client } from "@/components/ui/ClientList";
import { createClient } from "@/utils/supabase/server";
import { UserResponse } from "@supabase/supabase-js";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params; // agentId

  const data = await getData(slug);
  return Response.json(data);
}

const getData = async (id: string): Promise<string[]> => {
  const supabase = createClient();
  const user: UserResponse = await supabase.auth.getUser();
  // Standard users
  const { data, error } = await supabase
    .from("clients")
    .select()
    .eq("agent_id", id);

  if (error) {
    console.log(error);
    return [];
  }

  if (data) {
    let urls: string[] = [];
    data.forEach((d) => {
      let links = d.policy_link.split(" ");
      links.forEach((link: string) => urls.push(link));
    });
    return urls;
  }

  return [];
};
