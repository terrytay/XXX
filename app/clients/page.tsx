import DataTable, { Client, columns } from "@/components/ui/ClientList";
import { createClient } from "@/utils/supabase/server";
import { bounceOut } from "../auth/action";
import { UserResponse } from "@supabase/supabase-js";
import { getAllDividends, getClient, getClients } from "../portfolio/action";
import moment from "moment";
import { formatPercent } from "@/utils/formatters";
import { ApplicationType, getWelcomeBonus } from "@/utils/transactionsParser";

export default async function ClientList() {
  const supabase = createClient();
  const user: UserResponse = await supabase.auth.getUser();

  if (!user.data.user) {
    return await bounceOut();
  }

  const preferences = await supabase
    .from("agents")
    .select()
    .eq("agent_id", user?.data.user.id);

  const getData = async (): Promise<Client[]> => {
    // Admin
    if (preferences.data?.at(0).admin && preferences.data.at(0).adminView) {
      const { data, error } = await supabase.from("clients").select();
      if (error) {
        return [];
      }

      if (data) {
        return data;
      }
      return [];
    } else {
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
    }
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

    let additionalTia = 0;
    if (preferences.data?.at(0).include && policy != null) {
      additionalTia = getWelcomeBonus(policy!);
    }

    if (policy != null) {
      const { policyDetails, profile, transactions } = policy;

      let withdrawedAmount = 0;
      transactions.forEach((trx) => {
        if (trx.type.includes(ApplicationType.SurrenderWithdrawal)) {
          withdrawedAmount += +trx.transactionAmount.trim().split(",").join("");
        }
      });

      d.tiv = (+policyDetails.tiv.trim().split(",").join("")).toString();

      d.tia = policyDetails.tia + additionalTia - withdrawedAmount;
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
          d.tia) /
          d.tia
      );

      d.commencementDate = moment(profile.commencementDate, "DD/MM/YYYY")
        .toString()
        .split(" 00:00:00 ")[0];

      d.premium = profile.premium;

      d.dividendsPaidout = totalDividendsPaidout;

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

  // data.forEach((client) => {
  //   totalPremium += client.tia || 0;
  //   totalAum += +client.tiv?.trim().split(",").join("") || 0;
  // });

  res.forEach((r) => {
    totalPremium += r.tia;
    totalAum += +r.tiv.trim().split(",").join("");
  });

  if (totalAum != 0) {
    totalRoi = formatPercent((totalAum - totalPremium) / totalAum);
  } else {
    totalRoi = "0";
  }

  const aggregatedData = { totalAum, totalPremium, totalRoi };
  return (
    <div className=" mx-auto pb-10 print:mt-10">
      <h2 className="text-xl pb-2 pl-1">Portfolios Overview</h2>
      <DataTable columns={columns} data={res} aggregatedData={aggregatedData} />
    </div>
  );
}
