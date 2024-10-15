import { createClient } from "@/utils/supabase/server";
import { UserResponse } from "@supabase/supabase-js";
import { bounceOut } from "../auth/action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ToggleThemeComponent from "@/components/ui/toggleThemeComponent";
import {
  toggleAdminView,
  toggleBeta,
  toggleBonus,
  toggleTheme,
  toggleXirr,
} from "../action";
import ToggleWelcomeBonusComponent from "@/components/ui/toggleWelcomeBonusComponent";
import ToggleAdminViewComponent from "@/components/ui/toggleAdminViewComponent";
import ToggleBetaComponent from "@/components/ui/toggleBetaComponent";
import ToggleXirrComponent from "@/components/ui/toggleXirrComponent";

export default async function Page({
  params,
}: {
  params: { policy_number: string };
}) {
  const supabase = createClient();
  const user: UserResponse = await supabase.auth.getUser();

  if (!user.data.user) {
    return await bounceOut();
  }

  const { data, error } = await supabase
    .from("agents")
    .select()
    .eq("agent_id", user?.data.user.id);

  const dark: boolean = data?.at(0).dark || false;
  const include: boolean = data?.at(0).include || false;
  const beta: boolean = data?.at(0).beta || false;
  const xirr: boolean = data?.at(0).xirr || false;

  // admin
  const admin: boolean = data?.at(0).admin || false;
  const adminView: boolean = data?.at(0).adminView || false;

  return (
    <section className="mx-[10rem]">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col space-y-2">
          <div className="flex">
            <div>Night Mode:</div>
            <ToggleThemeComponent
              dark={dark}
              toggleTheme={toggleTheme}
              id={user?.data.user.id || ""}
            />
          </div>
          <div className="flex">
            <div>Include Welcome Bonus as Premium:</div>
            <ToggleWelcomeBonusComponent
              include={include}
              id={user?.data.user.id || ""}
              toggleBonus={toggleBonus}
            />
          </div>
          {/* <div className="flex">
            <div>Use beta:</div>
            <ToggleBetaComponent
              beta={beta}
              id={user?.data.user.id || ""}
              toggleBeta={toggleBeta}
            />
          </div> */}
          <div className="flex">
            <div>Use XIRR:</div>
            <ToggleXirrComponent
              xirr={xirr}
              id={user?.data.user.id || ""}
              toggleXirr={toggleXirr}
            />
          </div>
          {admin && (
            <div className="flex">
              <div>Debug Mode:</div>
              <ToggleAdminViewComponent
                adminView={adminView}
                id={user?.data.user.id || ""}
                toggleAdminView={toggleAdminView}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
