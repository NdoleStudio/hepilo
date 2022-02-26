export const DEFAULT_CURRENCY = "USD";

export const getDefaultCurrency = async (): Promise<string> => {
  try {
    const response = await fetch("https://ipapi.co/currency");
    if (!response.ok) {
      return DEFAULT_CURRENCY;
    }
    return response.text();
  } catch (e) {
    return DEFAULT_CURRENCY;
  }
};
