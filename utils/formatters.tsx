export function formatPercent(amount: number): string {
  const formatter = new Intl.NumberFormat("en-SG", {
    style: "percent",
    currency: "SGD",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });

  return formatter.format(amount);
}

export function format2dp(amount: number): string {
  const formatter = new Intl.NumberFormat("en-SG", {
    style: "decimal",
    currency: "SGD",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });

  return formatter.format(amount);
}

export function formatUnits(amount: number): string {
  const formatter = new Intl.NumberFormat("en-SG", {
    style: "decimal",
    currency: "SGD",
    maximumFractionDigits: 3,
    minimumFractionDigits: 3,
  });

  return formatter.format(amount);
}

export function formatAmount(amount: number): string {
  const formatter = new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });

  return formatter.format(amount);
}
