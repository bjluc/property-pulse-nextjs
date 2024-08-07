import GoogleProvider from 'next-auth/providers/google'
import connectDB from '@/config/database'
import User from '@/models/User'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  callbacks: {
    // Invoked for successful sign in
    async signIn({ profile }) {
      // 1. connect to database
      await connectDB()
      // 2. check if user exist
      const userExist = await User.findOne({ email: profile.email })
      // 3. if not create user
      if (!userExist) {
        // Truncate if username is too long. Limit to 20 characters
        const username = profile.name.slice(0, 20)

        await User.create({
          email: profile.email,
          username,
          image: profile.picture,
        })
      }
      // 4. return true to allow sign in
      return true
    },
    // session callback function that modifies the session object
    async session({ session }) {
      // 1. get user from database
      const user = await User.findOne({ email: session.user.email })
      // 2. assign user id from the session
      session.user.id = user._id.toString()
      // 3. return the session
      return session
    },
  },
}
