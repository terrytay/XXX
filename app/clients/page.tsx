import DataTable, { Client, columns } from "@/components/ui/ClientList";
import { createClient } from "@/utils/supabase/server";
import { bounceOut } from "../auth/action";
import { UserResponse } from "@supabase/supabase-js";
import { getAllDividends, getClient, getClients } from "../portfolio/action";
import moment from "moment";
import { formatPercent } from "@/utils/formatters";

export default async function ClientList() {
  const supabase = createClient();
  const user: UserResponse = await supabase.auth.getUser();

  if (!user.data.user) {
    return await bounceOut();
  }

  const getData = async (): Promise<Client[]> => {
    // Admin
    // if (user.data.user?.id === "364c9a6d-ba68-49d7-a227-3692346722c1") {
    //   const { data, error } = await supabase.from("clients").select();
    //   if (error) {
    //     return [];
    //   }

    //   if (data) {
    //     return data;
    //   }
    //   return [];
    // }

    // Standard users
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
  const clients = (await getClients(data.map((d) => d.policy_number))) || [];
  const allDividends =
    (await getAllDividends(data.map((d) => d.policy_number))) || [];

  let res: Client[] = [];

  // To populate each client's premium, aum, roi
  data.forEach((d) => {
    const policy = clients.find((val) => val.policyNumber === d.policy_number);
    const dividends = allDividends.find(
      (val) => val.policyNumber === d.policy_number
    );

    if (policy != null) {
      const { policyDetails, profile } = policy;
      d.tiv = policyDetails.tiv;
      d.tia = policyDetails.tia;
      d.productName = policyDetails.productName;

      let totalDividendsPaidout = 0;
      dividends?.dividends.forEach((div) => {
        if (div.method !== "Reinvest") {
          totalDividendsPaidout += +div.amount.trim().split(",").join("");
        }
      });
      d.grossProfit = formatPercent(
        (+policyDetails.tiv.trim().split(",").join("") +
          totalDividendsPaidout -
          policyDetails.tia) /
          policyDetails.tia
      );

      d.commencementDate = moment(profile.commencementDate, "DD/MM/YYYY")
        .toString()
        .split(" 00:00:00 ")[0];

      d.premium = profile.premium;

      res.push(d);
    }
  });

  // To agregate total premium, aum, roi
  let totalPremium = 0;
  let totalAum = 0;
  let totalRoi = "";

  allDividends.forEach((dividend) => {
    dividend.dividends.forEach((div) => {
      totalAum += +div.amount.trim().split(",").join("");
    });
  });

  data.forEach((client) => {
    totalPremium += client.tia || 0;
    totalAum += +client.tiv?.trim().split(",").join("") || 0;
  });

  if (totalAum != 0) {
    totalRoi = formatPercent((totalAum - totalPremium) / totalAum);
  } else {
    totalRoi = "0";
  }

  const aggregatedData = { totalAum, totalPremium, totalRoi };
  return (
    <div className=" mx-auto pb-10">
      <h2 className="text-xl pb-2 pl-1">Portfolios Overview</h2>
      <DataTable columns={columns} data={res} aggregatedData={aggregatedData} />
    </div>
  );
}
