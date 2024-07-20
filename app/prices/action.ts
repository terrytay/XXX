export const maxDuration = 12;

export const getPrices = async () => {
  "use server";

  try {
    const result = await fetch(process.env.GE_PRICES!, {
      signal: AbortSignal.timeout(10000),
    });
    console.log(result);
    return await result.json();
  } catch (error) {
    return null;
  }
};
