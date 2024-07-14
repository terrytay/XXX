export type DividendData = {
  agentId: string;
  policyNumber: string;
  dividends: {
    amount: string;
    payout: string;
    code: string;
    date: string;
    method: string;
    rate: string;
  }[];
};

export type PolicyRecord = {
  agentId: string;
  policyNumber: string;
  data: {
    date: string;
    tiv: number;
    tia: number;
  }[];
};

export type PolicyFund = {
  name: string;
  totalFundUnits: string;
  unitPrice: string;
  totalFundValue: string;
  apportionmentRate: string;
};

export type FpmsData = {
  agentId: string;
  policyNumber: string;
  lastUpdated: string;
  profile: {
    name: string;
    commencementDate: string;
    premium: string;
    premiumFreq: string;
    hasWelcomeBonus: boolean;
  };
  policyDetails: {
    funds: PolicyFund[];
    tiv: string;
    tia: number;
    grossProfit: string;
  };
  transactions: {
    seq: string;
    type: string;
    code: string;
    transactionAmount: string;
    transactionUnits: string;
    transactionPrice: string;
    runDate: string;
    effectiveDate: string;
    balanceUnits: string;
  }[];
};
