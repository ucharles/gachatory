export function propertyTranslator(property: string, lng: string | null) {
  switch (property) {
    case "title":
      switch (lng) {
        case "ko":
          return "제목";
        case "en":
          return "Title";
        case "ja":
          return "タイトル";
        default:
          return "Title";
      }
    case "character":
      switch (lng) {
        case "ko":
          return "캐릭터";
        case "en":
          return "Character";
        case "ja":
          return "キャラクター";
        default:
          return "Character";
      }
    case "brand":
      switch (lng) {
        case "ko":
          return "브랜드";
        case "en":
          return "Brand";
        case "ja":
          return "ブランド";
        default:
          return "Brand";
      }
    case "series":
      switch (lng) {
        case "ko":
          return "시리즈";
        case "en":
          return "Series";
        case "ja":
          return "シリーズ";
        default:
          return "Series";
      }
    case "author":
      switch (lng) {
        case "ko":
          return "작가";
        case "en":
          return "Author";
        case "ja":
          return "作者";
        default:
          return "Author";
      }
    case "category":
      switch (lng) {
        case "ko":
          return "카테고리";
        case "en":
          return "Category";
        case "ja":
          return "カテゴリー";
        default:
          return "Category";
      }
    case "element":
      switch (lng) {
        case "ko":
          return "요소";
        case "en":
          return "Element";
        case "ja":
          return "要素";
        default:
          return "Element";
      }
  }
}
