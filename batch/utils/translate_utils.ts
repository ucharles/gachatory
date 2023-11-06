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

  let leftBracket = "";

  if (
    translatedRightBracket?.length !== translatedLeftBracket?.length &&
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
  }

  return leftBracket + translated;
}

function getRightBracket(text: string) {
  const rightBracket = text.match(/\)\]】/);
  if (rightBracket) {
    return rightBracket[0];
  } else {
    return "";
  }
}
