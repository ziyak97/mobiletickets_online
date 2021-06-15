import { auth } from 'lib/firebase'

interface ErrorMessage {
  message: string
  field?: string
}

interface CustomError {
  errors: ErrorMessage[]
}

interface FetchResponse<T> {
  data: T
  errors: CustomError
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isCustomError(arg: any): arg is CustomError {
  return arg && arg.errors && arg.errors[0] && arg.errors[0].message
}

/**
 * Checks if ticket url is valid.
 * @param {string} input The url.
 * @return {boolean} If the url is a valid ticketek url.
 */
export function isValidTicketekUrl(input: string): boolean {
  const regex = /^https:\/\/www\.ticketek\.mobi\/\?id=/
  return regex.test(input)
}

// export const API = 'http://localhost:5001/mobiletickets-online/us-central1/api'
export const API = 'https://us-central1-mobiletickets-online.cloudfunctions.net/api'

/**
 * A helper function to fetch data from your API.
 * It sets the Firebase auth token on the request.
 */
export async function fetchFromAPI<T>(
  endpointURL: string,
  opts?: { method?: string; body?: Record<string, unknown> }
): Promise<FetchResponse<T>> {
  const { method, body }: { method: string; body: Record<string, unknown> } = {
    method: 'POST',
    body: null,
    ...opts,
  }

  const user = auth.currentUser
  const token = user && (await user.getIdToken())

  const res = await fetch(`${API}/${endpointURL}`, {
    method,
    ...(body && { body: JSON.stringify(body) }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  let errors: CustomError

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: T | CustomError | any = await res.json()

  if (data.errors) {
    if (!isCustomError(data)) {
      errors = { errors: [{ message: 'Something went wrong' }] }
    } else {
      errors = data
    }
  }
  return { data, errors }
}
