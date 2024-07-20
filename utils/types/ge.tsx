export type FundPrice = {
  fixedId?: number;
  funds: {
    fundCode: string;
    fundBidPrice: string;
    fundName: string;
  }[];
};
