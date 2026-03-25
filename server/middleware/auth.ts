import { auth } from '../utils/auth'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({
    headers: event.headers,
  })
  event.context.auth = session
})
