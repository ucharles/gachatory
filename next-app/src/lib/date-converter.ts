export function dateConveter(date: string) {
  const regex: RegExp = /(\d{4}).?(\d{2})/;
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

export function dateConverterSixDigitAndDot(date: string) {
  const regex: RegExp = /(\d{4}).?(\d{2})/;
  const matched = date.match(regex);

  if (!matched) {
    return "";
  }

  const year = matched[1];
  const month = matched[2].length === 1 ? "0" + matched[2] : matched[2];

  return year + "." + month;
}

export function convertToLocalTime(isoDateString: string): string {
  // ISO 형식의 문자열을 Date 객체로 변환
  const date = new Date(isoDateString);

  // Intl.DateTimeFormat을 사용하여 사용자의 로컬 시간대에 맞는 날짜와 시간을 포맷
  const dateTimeFormatOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    // second: "2-digit",
    hourCycle: "h23", // 24시간 형식을 사용하려면 이 옵션을 설정
  };

  // 로컬 시간대로 변환된 날짜와 시간 문자열 반환
  return Intl.DateTimeFormat("default", dateTimeFormatOptions).format(date);
}
