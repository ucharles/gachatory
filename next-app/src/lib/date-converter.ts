export function dateConveter(date: string) {
  const regex: RegExp = /(\d{4})-(\d{2})/;
  const matched = date.match(regex);
  if (!matched) {
    return null;
  }
  const year = matched[1];
  const month = matched[2].length === 1 ? "0" + matched[2] : matched[2];

  return year + "年" + month + "月";
}

export function dateTranslator(date: string, lng: string | null) {
  const regex: RegExp = /(\d{4}).(\d{2})/;
  const matched = date.match(regex);

  if (!matched) {
    return "";
  }

  const year = matched[1];
  const month = matched[2].length === 1 ? "0" + matched[2] : matched[2];

  switch (lng) {
    case "ko":
      return year + "년 " + month + "월";
    case "en":
      return month + "/" + year;
    default:
      return year + "年" + month + "月";
  }
}
