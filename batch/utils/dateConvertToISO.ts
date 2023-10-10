export function dateConvertToISO(dates: string[]) {
  let newDateArray = [];
  for (const dateString of dates) {
    let parsedDate;
    const dateStr = dateString.trim();
    if (/^.*上旬.*$/.test(dateStr)) {
      parsedDate = new Date(
        `${dateStr.substr(0, 4)}-${dateStr.substr(5, 2)}-01`
      );
    } else if (/^.*中旬.*$/.test(dateStr)) {
      parsedDate = new Date(
        `${dateStr.substr(0, 4)}-${dateStr.substr(5, 2)}-15`
      );
    } else if (/^.*下旬.*$/.test(dateStr)) {
      const year = parseInt(dateStr.substr(0, 4));
      const month = parseInt(dateStr.substr(5, 2));
      const lastDay = new Date(year, month, 0).getDate();
      parsedDate = new Date(
        `${dateStr.substr(0, 4)}-${dateStr.substr(5, 2)}-${lastDay}`
      );
    } else {
      const year = parseInt(dateStr.substr(0, 4));
      const month = parseInt(dateStr.substr(5, 2));
      const lastDay = new Date(year, month, 0).getDate();
      parsedDate = new Date(
        `${dateStr.substr(0, 4)}-${dateStr.substr(5, 2)}-${lastDay}`
      );
    }
    newDateArray.push(parsedDate);
  }

  return newDateArray;
}
