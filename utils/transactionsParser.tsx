import { FpmsData } from "./types/fpms";

export enum ApplicationType {
  Fee = "Policy Fee",
  SwitchIn = "Switch In",
  SwitchOut = "Switch Out",
  Inflow = "Net Investment Premium",
  WelcomeBonus = "Welcome Bonus",
  Reinvest = "Reinvest",
  RiskCharge = "Risk Charge",
  Conversion = "CONVERSION",
  CampaignBonus = "Campaign Bonus",
  SurrenderWithdrawal = "Surrender Withdrawal",
  RiderPremium = "Rider Premium",
}

type AllocatedTransaction = {
  date: string;
  price: number;
  units: number;
  value: number;
  description: string;
  balanceUnits: number;
};

type AllocatedFund = {
  code: string;
  transactions: AllocatedTransaction[];
  totalUnitsAfterFees: number;
  totalValueAfterFees: number;
  averagePrice?: number;
};

type SnapshotFund = {
  code: string;
  units: string;
  price: string;
};

type Snapshot = {
  date: string;
  funds: SnapshotFund[];
  tiv: number;
  tia: number;
};

function convertStringToNumber(str: string) {
  return +str.trim().split(",").join("");
}

export function getWelcomeBonus(data: FpmsData) {
  let result = 0;
  const transactions = data.transactions.slice().reverse();
  transactions.forEach((trx) => {
    if (
      trx.type.includes(ApplicationType.WelcomeBonus) ||
      trx.type.includes(ApplicationType.CampaignBonus)
    ) {
      result += +trx.transactionAmount.trim().split(",").join("");
    }
  });

  return result;
}

export function getTransactionsSnapshotByMonth(
  data: FpmsData,
  welcomeBonusAsPremium: boolean
): Snapshot[] {
  const transactions = data.transactions.slice().reverse();
  let result: Snapshot[] = [];

  transactions.forEach((transaction) => {
    const [day, month, year] = transaction.runDate.split("/");
    const runDate = month.concat("/").concat(year);
    const index = result.findIndex((snapshot) => snapshot.date === runDate);
    if (index === -1) {
      if (
        transaction.type.includes(ApplicationType.Inflow) ||
        transaction.type.includes(ApplicationType.Conversion)
      ) {
        result.push({
          date: runDate,
          funds: [
            {
              code: transaction.code,
              units: transaction.balanceUnits,
              price: transaction.transactionPrice,
            },
          ],
          tiv: 0,
          tia: +transaction.transactionAmount.trim().split(",").join(""),
        });
      } else if (
        transaction.type.includes(ApplicationType.WelcomeBonus) ||
        transaction.type.includes(ApplicationType.CampaignBonus)
      ) {
        if (welcomeBonusAsPremium) {
          result.push({
            date: runDate,
            funds: [
              {
                code: transaction.code,
                units: transaction.balanceUnits,
                price: transaction.transactionPrice,
              },
            ],
            tiv: 0,
            tia: +transaction.transactionAmount.trim().split(",").join(""),
          });
        } else {
          result.push({
            date: runDate,
            funds: [
              {
                code: transaction.code,
                units: transaction.balanceUnits,
                price: transaction.transactionPrice,
              },
            ],
            tiv: 0,
            tia: 0,
          });
        }
      } else if (transaction.type.includes(ApplicationType.Reinvest)) {
        result.push({
          date: runDate,
          funds: [
            {
              code: transaction.code,
              units: transaction.balanceUnits,
              price: transaction.transactionPrice,
            },
          ],
          tiv: 0,
          tia: 0,
        });
      } else if (transaction.type.includes(ApplicationType.SwitchOut)) {
        result.push({
          date: runDate,
          funds: [
            {
              code: transaction.code,
              units: transaction.balanceUnits,
              price: transaction.transactionPrice,
            },
          ],
          tia: 0,
          tiv: 0,
        });
      } else if (
        transaction.type.includes(ApplicationType.SurrenderWithdrawal)
      ) {
        result.push({
          date: runDate,
          funds: [
            {
              code: transaction.code,
              units: transaction.balanceUnits,
              price: transaction.transactionPrice,
            },
          ],
          tia: -1 * +transaction.transactionAmount.trim().split(",").join(""),
          tiv: -1 * +transaction.transactionAmount.trim().split(",").join(""),
        });
      } else if (
        transaction.type.includes(ApplicationType.Fee) ||
        transaction.type.includes(ApplicationType.RiskCharge) ||
        transaction.type.includes(ApplicationType.RiderPremium)
      ) {
        result.push({
          date: runDate,
          funds: [
            {
              code: transaction.code,
              units: transaction.balanceUnits,
              price: transaction.transactionPrice,
            },
          ],
          tia: 0,
          tiv: 0,
        });
      } else if (transaction.type.includes(ApplicationType.SwitchIn)) {
        result.push({
          date: runDate,
          funds: [
            {
              code: transaction.code,
              units: transaction.balanceUnits,
              price: transaction.transactionPrice,
            },
          ],
          tia: 0,
          tiv: 0,
        });
      }
    } else {
      if (
        transaction.type.includes(ApplicationType.Inflow) ||
        transaction.type.includes(ApplicationType.Conversion) ||
        ((transaction.type.includes(ApplicationType.CampaignBonus) ||
          transaction.type.includes(ApplicationType.WelcomeBonus)) &&
          welcomeBonusAsPremium)
      ) {
        const fundIndex = result[index].funds.findIndex(
          (fund) => fund.code === transaction.code
        );
        if (fundIndex === -1) {
          result[index].funds.push({
            code: transaction.code,
            units: transaction.balanceUnits,
            price: transaction.transactionPrice,
          });
          result[index].tia += +transaction.transactionAmount
            .trim()
            .split(",")
            .join("");
        } else {
          result[index].funds[fundIndex].price = transaction.transactionPrice;
          result[index].funds[fundIndex].units = transaction.balanceUnits;
          result[index].tia += +transaction.transactionAmount
            .trim()
            .split(",")
            .join("");
        }
      } else if (
        transaction.type.includes(ApplicationType.SurrenderWithdrawal)
      ) {
        console.log("meow");
        const fundIndex = result[index].funds.findIndex(
          (fund) => fund.code === transaction.code
        );
        if (fundIndex === -1) {
          result[index].funds.push({
            code: transaction.code,
            units: transaction.balanceUnits,
            price: transaction.transactionPrice,
          });
          result[index].tia -= +transaction.transactionAmount
            .trim()
            .split(",")
            .join("");
          console.log(result[index]);
        } else {
          result[index].funds[fundIndex].price = transaction.transactionPrice;
          result[index].funds[fundIndex].units = transaction.balanceUnits;
          result[index].tia -= +transaction.transactionAmount
            .trim()
            .split(",")
            .join("");
          console.log(result[index]);
        }
      } else {
        const fundIndex = result[index].funds.findIndex(
          (fund) => fund.code === transaction.code
        );
        if (fundIndex === -1) {
          result[index].funds.push({
            code: transaction.code,
            units: transaction.balanceUnits,
            price: transaction.transactionPrice,
          });
        } else {
          result[index].funds[fundIndex].price = transaction.transactionPrice;
          result[index].funds[fundIndex].units = transaction.balanceUnits;
        }
      }
    }
  });

  let finalResult: Snapshot[] = [];
  let isFirst = true;

  result.forEach((res) => {
    if (isFirst) {
      let tiv = 0;
      res.funds.forEach(
        (fund) =>
          (tiv +=
            +fund.price.trim().split(",").join("") *
            +fund.units.trim().split(",").join(""))
      );
      console.log(res);

      finalResult.push({
        tia: res.tia,
        tiv: tiv,
        date: res.date,
        funds: res.funds,
      });
      isFirst = false;
    } else {
      console.log(res);
      let tia = finalResult[finalResult.length - 1].tia + res.tia;

      let fundsToAdd: SnapshotFund[] = [];

      finalResult[finalResult.length - 1].funds.forEach((previousMonthFund) => {
        const indexOfFund = res.funds.findIndex(
          (fund) => fund.code === previousMonthFund.code
        );
        if (indexOfFund === -1) {
          fundsToAdd.push(previousMonthFund);
        }
      });

      let tiv = 0;

      // Need to use price at new month
      fundsToAdd.forEach(
        (fund) =>
          (tiv +=
            +fund.price.trim().split(",").join("") *
            +fund.units.trim().split(",").join(""))
      );

      res.funds.forEach(
        (fund) =>
          (tiv +=
            +fund.price.trim().split(",").join("") *
            +fund.units.trim().split(",").join(""))
      );

      finalResult.push({
        tia: tia,
        tiv: tiv,
        date: res.date,
        funds: res.funds,
      });
    }
  });

  finalResult[finalResult.length - 1].tia += welcomeBonusAsPremium
    ? getWelcomeBonus(data)
    : 0;
  // finalResult[finalResult.length - 1].tiv = +data.policyDetails.tiv
  //   .trim()
  //   .split(",")
  //   .join("");

  return finalResult;
}

export function parseTransactions(data: FpmsData) {
  const transactions = data.transactions.slice().reverse();

  const allocatedFunds: AllocatedFund[] = [];

  transactions.forEach((transaction) => {
    if (
      transaction.type.includes(ApplicationType.SwitchIn) ||
      transaction.type.includes(ApplicationType.WelcomeBonus) ||
      transaction.type.includes(ApplicationType.CampaignBonus) ||
      transaction.type.includes(ApplicationType.Inflow) ||
      transaction.type.includes(ApplicationType.Conversion) ||
      transaction.type.includes(ApplicationType.Reinvest)
    ) {
      const index = allocatedFunds.findIndex(
        (value) => value.code === transaction.code
      );

      if (index === -1) {
        allocatedFunds.push({
          code: transaction.code,
          transactions: [
            {
              units: convertStringToNumber(transaction.transactionUnits),
              date: transaction.runDate,
              price: convertStringToNumber(transaction.transactionPrice),
              value: convertStringToNumber(transaction.transactionAmount),
              description: transaction.type,
              balanceUnits: convertStringToNumber(transaction.balanceUnits),
            },
          ],
          totalUnitsAfterFees: convertStringToNumber(
            transaction.transactionUnits
          ),
          totalValueAfterFees: convertStringToNumber(
            transaction.transactionAmount
          ),
        });
      } else {
        const dateIndex = allocatedFunds[index].transactions.findIndex(
          (trx) =>
            trx.date === transaction.runDate &&
            trx.description === transaction.type
        );
        if (dateIndex === -1) {
          allocatedFunds[index].transactions.push({
            units: convertStringToNumber(transaction.transactionUnits),
            date: transaction.runDate,
            price: convertStringToNumber(transaction.transactionPrice),
            value: convertStringToNumber(transaction.transactionAmount),
            description: transaction.type,
            balanceUnits: convertStringToNumber(transaction.balanceUnits),
          });
        } else {
          allocatedFunds[index].transactions[dateIndex].value +=
            convertStringToNumber(transaction.transactionAmount);
          allocatedFunds[index].transactions[dateIndex].units +=
            convertStringToNumber(transaction.transactionUnits);
        }

        allocatedFunds[index].totalUnitsAfterFees += convertStringToNumber(
          transaction.transactionUnits
        );
        allocatedFunds[index].totalValueAfterFees += convertStringToNumber(
          transaction.transactionAmount
        );
      }
    } else if (transaction.type.includes(ApplicationType.SwitchOut)) {
      const index = allocatedFunds.findIndex(
        (value) => value.code === transaction.code
      );

      if (index === -1) {
        allocatedFunds.push({
          code: transaction.code,
          transactions: [
            {
              units: -1 * convertStringToNumber(transaction.transactionUnits),
              date: transaction.runDate,
              price: convertStringToNumber(transaction.transactionPrice),
              value: convertStringToNumber(transaction.transactionAmount),
              description: transaction.type,
              balanceUnits: convertStringToNumber(transaction.balanceUnits),
            },
          ],
          totalUnitsAfterFees:
            -1 * convertStringToNumber(transaction.transactionUnits),
          totalValueAfterFees: convertStringToNumber(
            transaction.transactionAmount
          ),
        });
        // Reset total units and value after fees if balance units goes to 0.
        if (convertStringToNumber(transaction.balanceUnits) === 0) {
          allocatedFunds[allocatedFunds.length - 1].totalUnitsAfterFees = 0;
          allocatedFunds[allocatedFunds.length - 1].totalValueAfterFees = 0;
        }
        console.log(allocatedFunds[allocatedFunds.length - 1]);
      } else {
        const dateIndex = allocatedFunds[index].transactions.findIndex(
          (trx) =>
            trx.date === transaction.runDate &&
            trx.description === transaction.type
        );
        if (dateIndex === -1) {
          allocatedFunds[index].transactions.push({
            units: -1 * convertStringToNumber(transaction.transactionUnits),
            date: transaction.runDate,
            price: convertStringToNumber(transaction.transactionPrice),
            value: convertStringToNumber(transaction.transactionAmount),
            description: transaction.type,
            balanceUnits: convertStringToNumber(transaction.balanceUnits),
          });
        } else {
          allocatedFunds[index].transactions[dateIndex].value +=
            convertStringToNumber(transaction.transactionAmount);
          allocatedFunds[index].transactions[dateIndex].units +=
            -1 * convertStringToNumber(transaction.transactionUnits);
        }

        // Reset total units and value after fees if balance units goes to 0.
        if (convertStringToNumber(transaction.balanceUnits) === 0) {
          allocatedFunds[index].totalUnitsAfterFees = 0;
          allocatedFunds[index].totalValueAfterFees = 0;
        } else {
          allocatedFunds[index].totalUnitsAfterFees +=
            -1 * convertStringToNumber(transaction.transactionUnits);
          allocatedFunds[index].totalValueAfterFees += convertStringToNumber(
            transaction.transactionAmount
          );
        }
        console.log(allocatedFunds[index]);
      }
    } else if (
      transaction.type.includes(ApplicationType.Fee) ||
      transaction.type.includes(ApplicationType.RiskCharge) ||
      transaction.type.includes(ApplicationType.RiderPremium)
    ) {
      const index = allocatedFunds.findIndex(
        (value) => value.code === transaction.code
      );

      if (index === -1) {
        allocatedFunds.push({
          code: transaction.code,
          transactions: [],
          totalUnitsAfterFees:
            -1 * convertStringToNumber(transaction.transactionUnits),
          totalValueAfterFees:
            -1 * convertStringToNumber(transaction.transactionAmount),
        });
      } else {
        allocatedFunds[index].totalUnitsAfterFees +=
          -1 * convertStringToNumber(transaction.transactionUnits);
        allocatedFunds[index].totalValueAfterFees +=
          -1 * convertStringToNumber(transaction.transactionAmount);
      }
    } else if (transaction.type.includes(ApplicationType.SurrenderWithdrawal)) {
      const index = allocatedFunds.findIndex(
        (value) => value.code === transaction.code
      );

      if (index === -1) {
        allocatedFunds.push({
          code: transaction.code,
          transactions: [
            {
              units: -1 * convertStringToNumber(transaction.transactionUnits),
              date: transaction.runDate,
              price: convertStringToNumber(transaction.transactionPrice),
              value: -1 * convertStringToNumber(transaction.transactionAmount),
              description: transaction.type,
              balanceUnits: convertStringToNumber(transaction.balanceUnits),
            },
          ],
          totalUnitsAfterFees:
            -1 * convertStringToNumber(transaction.transactionUnits),
          totalValueAfterFees:
            -1 * convertStringToNumber(transaction.transactionAmount),
        });
      } else {
        allocatedFunds[index].transactions.push({
          units: -1 * convertStringToNumber(transaction.transactionUnits),
          date: transaction.runDate,
          price: -1 * convertStringToNumber(transaction.transactionPrice),
          value: convertStringToNumber(transaction.transactionAmount),
          description: transaction.type,
          balanceUnits: convertStringToNumber(transaction.balanceUnits),
        });
        allocatedFunds[index].totalUnitsAfterFees +=
          -1 * convertStringToNumber(transaction.transactionUnits);
        allocatedFunds[index].totalValueAfterFees +=
          -1 * convertStringToNumber(transaction.transactionAmount);
      }
    }
  });

  allocatedFunds.forEach((fund) => {
    fund.averagePrice =
      fund.totalUnitsAfterFees > 0.1
        ? fund.totalValueAfterFees / fund.totalUnitsAfterFees
        : 0;

    if (fund.totalUnitsAfterFees <= 0.1) {
      fund.totalValueAfterFees = 0;
    }
  });

  return allocatedFunds;
  // return allocatedFunds.filter(
  //   (fund) => fund.totalUnitsAfterFees > 0.1 && fund.totalValueAfterFees >= 0
  // );
}
