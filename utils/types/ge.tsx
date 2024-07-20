export type FundPrice = {
  fixedId: number;
  lastUpdated: string;
  funds: {
    fundCode: string;
    fundBidPrice: string;
    fundName: string;
  }[];
};
