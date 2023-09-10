export function arrayOrganizer(
  arr: any[],
  header: string,
  description: string
) {
  let headerResult = "";
  let descriptionResult = "";
  if (header && description) {
    headerResult = arr[1].text;
    descriptionResult = arr[2].text;
  } else if (header) {
    headerResult = arr[1].text;
  } else if (description) {
    descriptionResult = arr[1].text;
  }
  return { headerResult, descriptionResult };
}
