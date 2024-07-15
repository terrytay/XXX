import { FpmsData } from "./types/fpms";

enum ApplicationType {
  Fee = "Policy Fee",
  SwitchIn = "Switch In",
  SwitchOut = "Switch Out",
  Inflow = "Net Investment Premium",
  WelcomeBonus = "Welcome Bonus",
}

type AllocatedTransaction = {
  date: string;
  price: number;
  units: number;
  value: number;
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

export function getTransactionsSnapshotByMonth(data: FpmsData): Snapshot[] {
  const transactions = data.transactions.reverse();
  let result: Snapshot[] = [];

  transactions.forEach((transaction) => {
    const [day, month, year] = transaction.runDate.split("/");
    const runDate = month.concat("/").concat(year);
    const index = result.findIndex((snapshot) => snapshot.date === runDate);
    if (index === -1) {
      if (transaction.type.includes(ApplicationType.Inflow)) {
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
      } else if (transaction.type.includes(ApplicationType.WelcomeBonus)) {
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
      } else if (transaction.type.includes(ApplicationType.Fee)) {
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
      if (transaction.type.includes(ApplicationType.Inflow)) {
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
      finalResult.push({
        tia: res.tia,
        tiv: tiv,
        date: res.date,
        funds: res.funds,
      });
      isFirst = false;
    } else {
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

  finalResult[finalResult.length - 1].tia = data.policyDetails.tia;
  finalResult[finalResult.length - 1].tiv = +data.policyDetails.tiv
    .trim()
    .split(",")
    .join("");

  return finalResult;
}

export function parseTransactions(data: FpmsData) {
  const transactions = data.transactions;

  const allocatedFunds: AllocatedFund[] = [];

  transactions.forEach((transaction) => {
    if (
      transaction.type.includes(ApplicationType.SwitchIn) ||
      transaction.type.includes(ApplicationType.WelcomeBonus) ||
      transaction.type.includes(ApplicationType.Inflow)
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
          (trx) => trx.date === transaction.runDate
        );

        if (dateIndex != -1) {
          allocatedFunds[index].transactions[dateIndex].units +=
            convertStringToNumber(transaction.transactionUnits);
          allocatedFunds[index].transactions[dateIndex].value +=
            convertStringToNumber(transaction.transactionAmount);
        } else {
          allocatedFunds[index].transactions.push({
            units: convertStringToNumber(transaction.transactionUnits),
            date: transaction.runDate,
            price: convertStringToNumber(transaction.transactionPrice),
            value: convertStringToNumber(transaction.transactionAmount),
          });
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
            },
          ],
          totalUnitsAfterFees:
            -1 * convertStringToNumber(transaction.transactionUnits),
          totalValueAfterFees: convertStringToNumber(
            transaction.transactionAmount
          ),
        });
      } else {
        const dateIndex = allocatedFunds[index].transactions.findIndex(
          (trx) => trx.date === transaction.runDate
        );

        if (dateIndex != -1) {
          allocatedFunds[index].transactions[dateIndex].units +=
            -1 * convertStringToNumber(transaction.transactionUnits);
          allocatedFunds[index].transactions[dateIndex].value +=
            convertStringToNumber(transaction.transactionAmount);
        } else {
          allocatedFunds[index].transactions.push({
            units: -1 * convertStringToNumber(transaction.transactionUnits),
            date: transaction.runDate,
            price: convertStringToNumber(transaction.transactionPrice),
            value: convertStringToNumber(transaction.transactionAmount),
          });
        }
        allocatedFunds[index].totalUnitsAfterFees +=
          -1 * convertStringToNumber(transaction.transactionUnits);
        allocatedFunds[index].totalValueAfterFees += convertStringToNumber(
          transaction.transactionAmount
        );
      }
    } else if (transaction.type.includes(ApplicationType.Fee)) {
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
    }
  });

  allocatedFunds.forEach((fund) => {
    fund.averagePrice =
      fund.totalUnitsAfterFees > 0.1
        ? fund.totalValueAfterFees / fund.totalUnitsAfterFees
        : 0;
  });

  return allocatedFunds.filter((fund) => fund.totalUnitsAfterFees > 0.1);
}
