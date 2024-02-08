export function brandTranslator(brand: string, lng: string) {
  if (lng === "ko") {
    switch (brand) {
      case "BANDAI":
        return "반다이";
      case "Takara Tomy Arts":
        return "타카라토미 아츠";
      case "BANDAI NAMCO":
        return "반다이 남코";
      case "KOROKORO":
        return "코로코로";
      case "BUSHIROAD CREATIVE":
        return "부시로드 크리에이티브";
      default:
        return brand;
    }
  } else if (lng === "en") {
    switch (brand) {
      case "BANDAI":
        return "Bandai";
      case "Takara Tomy Arts":
        return "Takara Tomy Arts";
      case "BANDAI NAMCO":
        return "Bandai Namco";
      case "KOROKORO":
        return "Korokoro";
      case "BUSHIROAD CREATIVE":
        return "Bushiroad Creative";
      default:
        return brand;
    }
  } else {
    return brand;
  }
}

export function bracketMatcher(translated: string, original?: string) {
  // original과 translated의 첫 글자 비교
  // original의 첫 글자가 괄호이면 translated의 첫 글자도 괄호여야 함
  // translated에서 가장 처음 만나는 오른쪽 괄호 탐색
  // 오른쪽 괄호에 맞는 왼쪽 괄호를 찾아 translated의 첫 글자에 붙임

  // const originalLeftBracket = original.match(/\(|\[|【/);
  const leftBracketRegex = /\(|\[|【/g;
  const rightBracketRegex = /\)|\]|】/g;
  const translatedLeftBracket = translated.match(leftBracketRegex);
  const translatedRightBracket = translated.match(rightBracketRegex);
  const translatedFirstCharInRegex = translated[0].match(leftBracketRegex);
  const translatedLastCharInRegex =
    translated[translated.length - 1].match(rightBracketRegex);

  // DeepL API 사용 시
  // 문자열 처음과 끝에 괄호가 있으면 제거되는 문제가 있어
  // 이를 해결하기 위한 함수 작성

  let leftBracket = "";
  let rightBracket = "";

  if (
    translatedRightBracket?.length > translatedLeftBracket?.length &&
    !translatedFirstCharInRegex
  ) {
    const rightBracket = translatedRightBracket[0];
    switch (rightBracket) {
      case ")":
        leftBracket = "(";
        break;
      case "]":
        leftBracket = "[";
        break;
      case "】":
        leftBracket = "【";
        break;
      default:
        break;
    }
  } else if (
    translatedRightBracket?.length < translatedLeftBracket?.length &&
    !translatedLastCharInRegex
  ) {
    const leftBracket = translatedLeftBracket[0];
    switch (leftBracket) {
      case "(":
        rightBracket = ")";
        break;
      case "[":
        rightBracket = "]";
        break;
      case "【":
        rightBracket = "】";
        break;
      default:
        break;
    }
  }

  return leftBracket + translated + rightBracket;
}

function getRightBracket(text: string) {
  const rightBracket = text.match(/\)\]】/);
  if (rightBracket) {
    return rightBracket[0];
  } else {
    return "";
  }
}
