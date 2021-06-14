/**
 * Checks if ticket url is valid.
 * @param {string} input The url.
 * @return {boolean} If the url is a valid ticketek url.
 */
export function isValidTicketekUrl(input: string): boolean {
  const regex = /^https:\/\/www\.ticketek\.mobi\/\?id=/;
  return regex.test(input);
}

/**
 * Gives id for ticketek url.
 * @param {string} input The url.
 * @return {string} Id of ticketek Url.
 */
export function getTicketekId(input: string): string {
  return input.split("?id=")[1];
}


export const csvFields = [
  {
    label: "Ticketek Url",
    value: "ticketekUrl",
  },
  {
    label: "Mobile Tickets Url",
    value: "mobileTicketsUrl",
  },
  {
    label: "Created At",
    value: "createdAt",
  },

];
