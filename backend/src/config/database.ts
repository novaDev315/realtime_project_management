import mongoose from 'mongoose'

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/project_management'

    await mongoose.connect(mongoUri)

    console.log('MongoDB connected successfully')

    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error)
    })

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected')
    })

    process.on('SIGINT', async () => {
      await mongoose.connection.close()
      process.exit(0)
    })
  } catch (error) {
    console.error('MongoDB connection failed:', error)
    process.exit(1)
  }
}
