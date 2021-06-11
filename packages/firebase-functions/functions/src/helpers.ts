/**
 * Checks if ticket url is valid.
 * @param {string} input The url.
 * @return {boolean} If the url is a valid ticketek url.
 */
export function isValidTicketekUrl(input: string): boolean {
  const regex = /^https:\/\/www\.ticketek\.mobi\/\?id=/;
  return regex.test(input);
}

