import { createClient } from "@/utils/supabase/client";

export const deleteClient = async (policy_number: string) => {
  const supabase = createClient();

  const response = await supabase
    .from("clients")
    .delete()
    .eq("policy_number", policy_number);
};

export const updateClient = async ({
  id,
  nickname,
  policy_number,
  policy_link,
}: {
  id: string;
  nickname: string;
  policy_number: string;
  policy_link: string;
}) => {
  const supabase = createClient();
  const user = await supabase.auth.getUser();
  const response = await supabase.from("clients").upsert({
    id,
    nickname,
    policy_number,
    policy_link,
    agent_id: user.data.user?.id,
  });
};

export const newClient = async ({
  nickname,
  policy_number,
  policy_link,
}: {
  nickname: string;
  policy_number: string;
  policy_link: string;
}) => {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  const id = data.user?.id;

  const response = await supabase
    .from("clients")
    .insert({ agent_id: id, nickname, policy_number, policy_link });
};
