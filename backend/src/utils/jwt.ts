import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_change_this'
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d'

export interface IJWTPayload {
  userId: string
  email: string
  name: string
}

export const generateToken = (payload: IJWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  })
}

export const verifyToken = (token: string): IJWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as IJWTPayload
  } catch (error) {
    throw new Error('Invalid token')
  }
}
