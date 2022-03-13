// Detects if the app is standalone
const isIosStandaloneMode = (): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!(window.navigator as any)?.standalone;
};

const isChromeStandaloneMode = (): boolean => {
  return window.matchMedia("(display-mode: standalone)").matches;
};

const isInStandaloneMode = (): boolean => {
  return isIosStandaloneMode() || isChromeStandaloneMode();
};

export const getPlatformName = (): string => {
  if (isInStandaloneMode()) {
    return "app";
  }
  return "website";
};

export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export const isDarkModeOn = (): boolean => {
  return (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
};

export const getBooleanFromLocalStorage = (
  key: string,
  defaultValue = false
): boolean => {
  const valueString = localStorage.getItem(key);
  if (valueString == null) {
    return defaultValue;
  }

  const value = JSON.parse(valueString);
  if (value === true || value === false) {
    return value;
  }

  return defaultValue;
};
