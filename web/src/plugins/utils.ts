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

export const isDarkModeOn = (): boolean => {
  return (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
};