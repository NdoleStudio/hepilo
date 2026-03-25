export const date = (value: Date): string => {
  const locale = "en-US";
  const month = new Intl.DateTimeFormat(locale, { month: "short" }).format(
    value
  );
  const day = new Intl.DateTimeFormat(locale, { day: "numeric" }).format(value);

  const year = new Intl.DateTimeFormat(locale, { year: "numeric" }).format(
    value
  );

  return `${month} ${day}, ${year}`;
};
