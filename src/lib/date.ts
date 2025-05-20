export const formattedDate = (date: string) => {
  return new Date(date).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export const formattedDateEn = (date: string) => {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();

  return `${month}/${day}/${year}`;
};

export const formattedDateWithHyphen = (date: string) => {
  return new Date(date)
    .toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\//g, "-");
};
