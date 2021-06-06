export function isValidTicketekUrl(input: string): boolean {
  const regex = /^https:\/\/www\.ticketek\.mobi\/\?id=/
  return regex.test(input)
}
