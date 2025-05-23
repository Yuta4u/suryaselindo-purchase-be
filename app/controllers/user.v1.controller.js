const API_CONFIG = {
  BASE_URL: process.env.BASE_URL,
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  ENDPOINTS: {
    TOKEN: 'oauth/token',
    USER: 'getUser',
  },
}

const DEFAULT_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
}

exports.getToken = async (req, res, next) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res
      .status(400)
      .json({ status_code: 400, error: 'Username and password are required' })
  }

  try {
    const tokenData = {
      grant_type: 'password',
      client_id: API_CONFIG.CLIENT_ID,
      client_secret: API_CONFIG.CLIENT_SECRET,
      username,
      password,
    }

    const response = await fetch(
      `${process.env.BASE_URL}${API_CONFIG.ENDPOINTS.TOKEN}`,
      {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(tokenData),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return res.status(400).json({
        status_code: 400,
        error: data.error_description || 'Failed to get token',
      })
    }

    res.status(201).json({ status_code: 201, ...data })
  } catch (error) {
    next(error) // Pass error to global handler
  }
}

exports.getUser = async (req, res, next) => {
  const jwt = req.headers.authorization
  if (!jwt) {
    return res
      .status(401)
      .json({ status_code: 401, error: 'Authorization token is required' })
  }

  try {
    const response = await fetch(
      `${process.env.BASE_URL}${API_CONFIG.ENDPOINTS.USER}`,
      {
        method: 'GET',
        headers: { ...DEFAULT_HEADERS, authorization: jwt },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return res
        .status(400)
        .json({ status_code: 400, error: 'Failed to get user data' })
    }

    res.status(201).json({ status_code: 201, ...data })
  } catch (error) {
    next(error) // Pass error to global handler
  }
}
