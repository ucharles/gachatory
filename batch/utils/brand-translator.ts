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
      default:
        return brand;
    }
  } else {
    return brand;
  }
}
