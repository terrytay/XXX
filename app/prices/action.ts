export const getPrices = async () => {
  "use server";

  try {
    const result = await fetch(process.env.GE_PRICES!);
    console.log(result);
    return await result.json();
  } catch (error) {
    return null;
  }
};
