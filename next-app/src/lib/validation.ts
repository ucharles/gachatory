export function validateLng(lng: string | null): string {
  const _lng = lng || "ja";
  const supportedLanguages = ["en", "ja", "ko"];
  return supportedLanguages.includes(_lng) ? _lng : "ja";
}
