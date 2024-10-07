import { FundPrice } from "@/utils/types/ge";
import { updateFunds, updatePrices } from "./action";

export const revalidate = 0;
export async function GET(request: Request) {
  try {
    const result = await fetch(process.env.GE_PRICES!);
    let fundPrices: FundPrice = await result.json();
    fundPrices.fixedId = 1;
    fundPrices.lastUpdated = new Date(Date.now()).toUTCString();
    await updatePrices(fundPrices);

    const results = await Promise.all(
      funds.map(async (fund) => {
        const prices = await fetch(fund.priceURL);
        let fundPrices = await prices.json();
        let fundDividends = null;
        if (fund.dividendURL) {
          const dividends = await fetch(fund.dividendURL);
          fundDividends = await dividends.json();
        }
        const toSend = {
          name: fund.name,
          prices: fundPrices,
          dividends: fundDividends,
        };
        return await updateFunds(toSend);
      })
    );
    return Response.json({ ok: true, results: results });
  } catch (error) {
    return Response.json({ ok: false });
  }
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
