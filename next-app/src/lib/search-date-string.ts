export function getCurrentMonthForSearch() {
  const today = new Date();
  const year = today.getFullYear().toString();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");

  return year + "-" + month;
}

export function getCurrentMonthYYYYMM() {
  const today = new Date();
  const year = today.getFullYear().toString();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");

  return year + month;
}

export function isYYYYMMFormat(input: string): boolean {
  // YYYYMM 형식에 맞는 정규 표현식
  const regex = /^(?:19|20)\d\d(0[1-9]|1[0-2])$/;

  // 정규 표현식과 문자열을 비교하여 판단
  return regex.test(input);
}

export function addMonthsToYYYYMM(
  dateString: string,
  n: number,
): string | null {
  // YYYYMM 형식의 문자열을 년도와 월로 분리
  const year = parseInt(dateString.slice(0, 4), 10);
  const month = parseInt(dateString.slice(4), 10);

  // 문자열을 날짜 객체로 변환
  const date = new Date(year, month - 1); // 월은 0부터 시작하므로 1을 빼기

  // n개월을 더하거나 빼기
  date.setMonth(date.getMonth() + n);

  // YYYYMM 형식으로 다시 포맷
  const newYear = date.getFullYear();
  const newMonth = date.getMonth() + 1; // 월을 다시 1을 더해 본래 형식으로 만들기

  // 월 부분이 한 자리일 경우 앞에 0 추가
  const newMonthString = newMonth < 10 ? `0${newMonth}` : newMonth.toString();

  return `${newYear}${newMonthString}`;
}

export function addDotToYYYYMM(YYYYMM: string): string {
  return YYYYMM.slice(0, 4) + "." + YYYYMM.slice(4);
}
