import DataTable, { Client, columns } from "@/components/ui/ClientList";
import { createClient } from "@/utils/supabase/server";
import { bounceOut } from "../auth/action";
import { UserResponse } from "@supabase/supabase-js";

export default async function ClientList() {
  const supabase = createClient();
  const user: UserResponse = await supabase.auth.getUser();

  if (!user.data.user) {
    return await bounceOut();
  }
  const getData = async (): Promise<Client[]> => {
    const { data, error } = await supabase
      .from("clients")
      .select()
      .eq("agent_id", user.data.user?.id);

    if (error) {
      return [];
    }

    if (data) {
      return data;
    }
    return [];
  };

  const data = await getData();

  return (
    <div className="container mx-auto py-10">
      <h2 className="text-xl pb-2 pl-1">List of Clients' Policies</h2>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
