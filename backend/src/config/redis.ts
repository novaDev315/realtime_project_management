import { createClient } from 'redis'

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

export const redisClient = createClient({
  url: redisUrl,
})

redisClient.on('error', (error) => {
  console.error('Redis Client Error:', error)
})

redisClient.on('connect', () => {
  console.log('Redis connected successfully')
})

export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect()
  } catch (error) {
    console.error('Redis connection failed:', error)
    process.exit(1)
  }
}

export default redisClient
