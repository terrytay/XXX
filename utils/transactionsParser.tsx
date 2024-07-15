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

type Snapshot = {
  date: string;
  tiv: number;
  tia: number;
};

function convertStringToNumber(str: string) {
  return +str.trim().split(",").join("");
}

export function getTransactionsSnapshotByMonth(data: FpmsData): Snapshot[] {
  const transactions = data.transactions;
  let result: Snapshot[] = [];

  transactions.forEach((transaction) => {
    const [day, month, year] = transaction.runDate.split("/");
    const runDate = month.concat("/").concat(year);
    const index = result.findIndex((snapshot) => snapshot.date === runDate);
    if (index === -1) {
      if (transaction.type.includes(ApplicationType.Inflow)) {
        console.log(transaction.transactionAmount);
        result.push({
          date: runDate,
          tia: +transaction.transactionAmount.trim().split(",").join(""),
          tiv: +transaction.transactionAmount.trim().split(",").join(""),
        });
      } else if (transaction.type.includes(ApplicationType.WelcomeBonus)) {
        result.push({
          date: runDate,
          tia: 0,
          tiv: +transaction.transactionAmount.trim().split(",").join(""),
        });
      } else if (transaction.type.includes(ApplicationType.SwitchOut)) {
        result.push({
          date: runDate,
          tia: 0,
          tiv: +transaction.transactionAmount.trim().split(",").join(""),
        });
      } else if (transaction.type.includes(ApplicationType.Fee)) {
        result.push({
          date: runDate,
          tia: 0,
          tiv: -1 * +transaction.transactionAmount.trim().split(",").join(""),
        });
      } else if (transaction.type.includes(ApplicationType.SwitchIn)) {
        result.push({
          date: runDate,
          tia: 0,
          tiv: +transaction.transactionAmount.trim().split(",").join(""),
        });
      }
    } else {
      if (transaction.type.includes(ApplicationType.Inflow)) {
        result[index].tia += +transaction.transactionAmount
          .trim()
          .split(",")
          .join("");
        result[index].tiv += +transaction.transactionAmount
          .trim()
          .split(",")
          .join("");
      } else if (transaction.type.includes(ApplicationType.WelcomeBonus)) {
        result[index].tia += 0;
        result[index].tiv += +transaction.transactionAmount
          .trim()
          .split(",")
          .join("");
      } else if (transaction.type.includes(ApplicationType.SwitchOut)) {
        result[index].tia += 0;
        result[index].tiv += +transaction.transactionAmount
          .trim()
          .split(",")
          .join("");
      } else if (transaction.type.includes(ApplicationType.Fee)) {
        result[index].tia += 0;
        result[index].tiv -= +transaction.transactionAmount
          .trim()
          .split(",")
          .join("");
      } else if (transaction.type.includes(ApplicationType.SwitchIn)) {
        result[index].tia += 0;
        result[index].tiv += +transaction.transactionAmount
          .trim()
          .split(",")
          .join("");
      } else {
      }
    }
  });

  let finalResult: Snapshot[] = [];
  let first = true;
  result.reverse().forEach((res) => {
    if (first) {
      finalResult.push(res);
    } else {
      finalResult.push({
        date: res.date,
        tia: res.tia + finalResult[finalResult.length - 1].tia,
        tiv: res.tiv + finalResult[finalResult.length - 1].tiv,
      });
    }
    first = false;
  });

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
