export const getPrices = async () => {
  "use server";

  const result = await fetch(process.env.GE_PRICES!);
  return await result.json();
};
