import FundChart from "@/components/FundChart";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getFunds } from "./action";
import { useState } from "react";

export type Price = {
  DataList: {
    Price: {
      Bid: {
        Amount: number;
      };
      Mid: {
        Amount: number;
      };
      Yield: {
        Amount: number;
      };
      PriceDate: string;
    };
  }[];
};

export type Dividend = {
  DataList: {
    Dividend: {
      PayDate: string;
      NetDividend: number;
    };
  }[];
};

export type Fund = {
  name: string;
  prices: Price;
  dividends: Dividend;
};

export default async function Page() {
  const funds = await getFunds();

  return (
    <section className="w-full">
      <FundChart fundString={JSON.stringify(funds)} />
    </section>
  );
}

const funds = [
  {
    name: "Greatlink US Income and Growth",
    priceURL:
      "https://digital.feprecisionplus.com/greateasternlife/en-GB/GreatEastern_V2/DownloadTool/GetPriceHistory?jsonString=%7B%22GrsProjectId%22%3A%2295400076%22%2C%22ProjectName%22%3A%22greateasternlife%22%2C%22ToolId%22%3A16%2C%22LanguageId%22%3A%221%22%2C%22LanguageCode%22%3A%22en-GB%22%2C%22OverrideDocumentCountryCode%22%3Anull%2C%22forSaleIn%22%3A%22%22%2C%22FSIexclCT%22%3A%22%22%2C%22UnitHistoryFilters%22%3A%7B%22CitiCode%22%3A%22ALIPX%22%2C%22Universe%22%3A%22SI%22%2C%22TypeCode%22%3A%22FSI%3AALIPX%22%2C%22BaseCurrency%22%3A%22SGD%22%2C%22PriceType%22%3A2%2C%22TimePeriod%22%3A%2236%22%2C%22StartDate%22%3Anull%2C%22EndDate%22%3Anull%7D%7D",
    dividendURL:
      "https://digital.feprecisionplus.com/greateasternlife/en-GB/GreatEastern_V2/DownloadTool/GetDividendHistory?jsonString=%7B%22GrsProjectId%22%3A%2295400076%22%2C%22ProjectName%22%3A%22greateasternlife%22%2C%22ToolId%22%3A16%2C%22LanguageId%22%3A%221%22%2C%22LanguageCode%22%3A%22en-GB%22%2C%22OverrideDocumentCountryCode%22%3Anull%2C%22forSaleIn%22%3A%22%22%2C%22FSIexclCT%22%3A%22%22%2C%22UnitHistoryFilters%22%3A%7B%22TypeCode%22%3A%22FSI%3AALIPX%22%2C%22BaseCurrency%22%3A%22SGD%22%2C%22PriceType%22%3A2%2C%22TimePeriod%22%3A%2236%22%2C%22StartDate%22%3Anull%2C%22EndDate%22%3Anull%7D%7D",
  },
  {
    name: "Greatlink Global Technology",
    priceURL:
      "https://digital.feprecisionplus.com/greateasternlife/en-GB/GreatEastern_V2/DownloadTool/GetPriceHistory?jsonString=%7B%22GrsProjectId%22%3A%2295400076%22%2C%22ProjectName%22%3A%22greateasternlife%22%2C%22ToolId%22%3A16%2C%22LanguageId%22%3A%221%22%2C%22LanguageCode%22%3A%22en-GB%22%2C%22OverrideDocumentCountryCode%22%3Anull%2C%22forSaleIn%22%3A%22%22%2C%22FSIexclCT%22%3A%22%22%2C%22UnitHistoryFilters%22%3A%7B%22CitiCode%22%3A%22CCA1%22%2C%22Universe%22%3A%22SI%22%2C%22TypeCode%22%3A%22FSI%3ACCA1%22%2C%22BaseCurrency%22%3A%22SGD%22%2C%22PriceType%22%3A2%2C%22TimePeriod%22%3Anull%2C%22StartDate%22%3Anull%2C%22EndDate%22%3Anull%7D%7D",
  },
  {
    name: "Greatlink Lion India",
    priceURL:
      "https://digital.feprecisionplus.com/greateasternlife/en-GB/GreatEastern_V2/DownloadTool/GetPriceHistory?jsonString=%7B%22GrsProjectId%22%3A%2295400076%22%2C%22ProjectName%22%3A%22greateasternlife%22%2C%22ToolId%22%3A16%2C%22LanguageId%22%3A%221%22%2C%22LanguageCode%22%3A%22en-GB%22%2C%22OverrideDocumentCountryCode%22%3Anull%2C%22forSaleIn%22%3A%22%22%2C%22FSIexclCT%22%3A%22%22%2C%22UnitHistoryFilters%22%3A%7B%22CitiCode%22%3A%22CCB3%22%2C%22Universe%22%3A%22SI%22%2C%22TypeCode%22%3A%22FSI%3ACCB3%22%2C%22BaseCurrency%22%3A%22SGD%22%2C%22PriceType%22%3A2%2C%22TimePeriod%22%3Anull%2C%22StartDate%22%3Anull%2C%22EndDate%22%3Anull%7D%7D",
  },
];
