import { createClient } from "@/utils/supabase/server";
import { bounceOut } from "@/app/auth/action";
import { UserResponse } from "@supabase/supabase-js";
import { getAllDividends, getClients } from "../action";
import { getPrices } from "@/app/prices/action";
import {
  ApplicationType,
  getWelcomeBonus,
  xirrCalculator,
} from "@/utils/transactionsParser";
import { formatPercent, format2dp } from "@/utils/formatters";
import moment from "moment";
import PortfolioDashboard from "@/components/PortfolioDashboard";
import { revalidatePath } from "next/cache";

export const maxDuration = 60;

export default async function PortfolioV2Overview() {
  const supabase = createClient();
  const user: UserResponse = await supabase.auth.getUser();

  if (!user.data.user) {
    return await bounceOut();
  }

  const preferences = await supabase
    .from("agents")
    .select()
    .eq("agent_id", user?.data.user.id);

  // Get client data
  const getData = async () => {
    if (preferences.data?.at(0).admin && preferences.data.at(0).adminView) {
      const { data, error } = await supabase.from("clients").select();
      return error ? [] : data || [];
    } else {
      const { data, error } = await supabase
        .from("clients")
        .select()
        .eq("agent_id", user.data.user?.id);
      return error ? [] : data || [];
    }
  };

  const clientsList = await getData();
  const clients = (await getClients(clientsList.map((d) => d.policy_number))) || [];
  const allDividends = (await getAllDividends(clientsList.map((d) => d.policy_number))) || [];
  const dailyPrices = await getPrices();

  // Process client data for dashboard
  const processedClients = clientsList.map((client) => {
    const policy = clients.find((val) => val.policyNumber === client.policy_number);
    const dividends = allDividends.find((val) => val.policyNumber === client.policy_number);

    if (!policy) return null;

    let additionalTia = 0;
    if (preferences.data?.at(0).include) {
      additionalTia = getWelcomeBonus(policy);
    }

    const { policyDetails, profile, transactions } = policy;

    // Calculate cash reserve
    let cash = 0;
    policyDetails.funds.forEach((fund) => {
      if (
        fund.name === "01: GreatLink Cash Fund" ||
        fund.name === "225: GreatLink US Income and Growth Fund (Dis)"
      ) {
        cash += +fund.totalFundValue.trim().split(",").join("");
      }
    });
    if (!client.nickname.includes(`(AM)`)) cash = 0;

    // Calculate withdrawals and charges
    let withdrawedAmount = 0;
    transactions.forEach((trx) => {
      if (
        trx.type.includes(ApplicationType.SurrenderWithdrawal) ||
        trx.type.includes(ApplicationType.PremiumHolidayCharge) ||
        trx.type.includes(ApplicationType.RiderPremium) ||
        trx.type.includes(ApplicationType.RiskCharge)
      ) {
        withdrawedAmount += +trx.transactionAmount.trim().split(",").join("");
      }
    });

    const tiv = +policyDetails.tiv.trim().split(",").join("");
    const tia = policyDetails.tia + additionalTia - withdrawedAmount;

    // Calculate total dividends paid out
    let totalDividendsPaidout = 0;
    dividends?.dividends.forEach((div) => {
      if (div.method !== "Reinvest") {
        totalDividendsPaidout += +div.amount.trim().split(",").join("");
      }
    });

    // Calculate performance metrics
    const grossProfit = formatPercent((tiv + totalDividendsPaidout - tia) / tia);
    const xirr = xirrCalculator(policy, dividends);

    // Determine policy type and risk level
    const isInsurance = 
      policyDetails.productName.toLowerCase().includes("great life advantage") ||
      policyDetails.productName.toLowerCase().includes("smart life advantage") ||
      profile.name.includes("GLA") ||
      policyDetails.productName.toLowerCase().includes("insurance");

    // Fund allocation analysis
    const fundAllocations = policyDetails.funds
      .filter((fund) => +fund.totalFundUnits.trim().split(",").join("") > 0.1)
      .map((fund) => ({
        name: fund.name,
        value: +fund.totalFundValue.trim().split(",").join(""),
        percentage: (+fund.totalFundValue.trim().split(",").join("") / tiv) * 100,
        units: +fund.totalFundUnits.trim().split(",").join(""),
        price: +fund.unitPrice.trim().split(",").join(""),
      }));

    // Calculate risk score based on fund types
    let riskScore = 0;
    fundAllocations.forEach((fund) => {
      if (fund.name.toLowerCase().includes("equity") || fund.name.toLowerCase().includes("growth")) {
        riskScore += fund.percentage * 0.8;
      } else if (fund.name.toLowerCase().includes("balanced")) {
        riskScore += fund.percentage * 0.5;
      } else if (fund.name.toLowerCase().includes("bond") || fund.name.toLowerCase().includes("cash")) {
        riskScore += fund.percentage * 0.2;
      } else {
        riskScore += fund.percentage * 0.6; // Default moderate risk
      }
    });

    return {
      ...client,
      tiv,
      tia,
      cash,
      grossProfit,
      xirr: !xirr.includes("N/A") ? formatPercent(+xirr) : "N/A",
      totalDividendsPaidout,
      commencementDate: moment(profile.commencementDate, "DD/MM/YYYY").format("YYYY-MM-DD"),
      premium: profile.premium,
      productName: policyDetails.productName,
      isInsurance,
      fundAllocations,
      riskScore: Math.min(riskScore / 100, 1), // Normalize to 0-1
      lastUpdated: policy.lastUpdated,
      duration: moment().diff(moment(profile.commencementDate, "DD/MM/YYYY"), "years", true),
    };
  }).filter(Boolean);

  // Calculate aggregated metrics
  const totalPremium = processedClients.reduce((acc, client) => acc + client.tia, 0);
  const totalAum = processedClients.reduce((acc, client) => acc + client.tiv, 0);
  const totalCash = processedClients.reduce((acc, client) => acc + client.cash, 0);
  const totalDividends = processedClients.reduce((acc, client) => acc + client.totalDividendsPaidout, 0);

  const aggregatedData = {
    totalPremium,
    totalAum,
    totalCash,
    totalDividends,
    totalRoi: totalAum ? formatPercent((totalAum + totalDividends - totalPremium) / totalPremium) : "0%",
    averageRiskScore: processedClients.length > 0 
      ? processedClients.reduce((acc, client) => acc + client.riskScore, 0) / processedClients.length 
      : 0,
    clientCount: processedClients.length,
  };

  const handleRefresh = async () => {
    "use server";
    revalidatePath("/portfolio/v2");
  };

  return (
    <div className="container mx-auto p-6">
      <PortfolioDashboard 
        clients={JSON.parse(JSON.stringify(processedClients))}
        aggregatedData={JSON.parse(JSON.stringify(aggregatedData))}
        preferences={JSON.parse(JSON.stringify(preferences.data?.at(0) || {}))}
        dailyPrices={JSON.parse(JSON.stringify(dailyPrices))}
        onRefresh={handleRefresh}
      />
    </div>
  );
}