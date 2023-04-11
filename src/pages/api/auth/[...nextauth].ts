import type { NextApiRequest, NextApiResponse } from "next/types";
import NextAuth, { Session, User } from "next-auth";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import { JwtUtils, UrlUtils } from "../../../constants/Utils";
import { AdapterUser } from "next-auth/adapters";
import { JWT } from "next-auth/jwt/types";


export interface ExtendedSession extends Session {
    pk?: string
    accessToken?: string
    refreshToken?: string
    email?: string
    username?: string
    firstName?: string
    lastName?: string
    profilePk?: string
    image?: string
    imageFromUrl?: string
    bio?: string
    birthDate?: string
  }
  
export interface ExtendedUser extends User {
    username?: string,
    password?: string,
  }

namespace NextAuthUtils {
  export const refreshToken = async function (refreshToken : string) {
    try {
      const response = await axios.post(
        UrlUtils.makeUrl(
          process.env.BACKEND_API_BASE ?? '',
          "token",
          "refresh",
        ),
        {
          refresh: refreshToken,
        },
      );

      const { access, refresh } = response.data;

      return [access, refresh];
    } catch {

      return [null, null];
    }
  };
}

export const authOptions: NextAuthOptions = {
  secret: process.env.SESSION_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  
  // jwt: {
  //   secret: process.env.JWT_SECRET,
  // },
  pages: {
    signIn: '/pages/login/',
  },
  debug: process.env.NODE_ENV === "development",
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "username" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        console.log(req)
        const user: ExtendedUser = { id: '', email: '' }
        try {
          const response = await axios.post(
            UrlUtils.makeUrl(
              'https://cheapr.my.id/',
              "api",
              "token",
            ),
            {
              headers: {
                'Content-Type': 'application/json',
            },
              username: credentials?.username,
              password: credentials?.password,
            },
          );

          // extract the returned token from the DRF backend and add it to the `user` object
          const { refresh, access } = response.data;
          console.log(response.data)

          // reform the `token` object from the access token we appended to the `user` object
          const data = {
            ...user,
            id: access,
            email: refresh,
          };

          return data;
        } catch (error) {

          return null;
        }
        
      }
    })
  ],
  callbacks: {
    async jwt({token, user, account, profile, isNewUser}) {
      console.log(profile)
      console.log(isNewUser)
      if (user) {
        if (account?.provider === "google") {
          try {
            const response = await axios.post(
              UrlUtils.makeUrl(
                process.env.BACKEND_API_BASE ?? '',
                "social",
                "login",
                account.provider,
              ),
              {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${account.access_token}`
              },
                access_token: account.access_token,
                id_token: account.id_token,
              },
            );

            const { access_token, refresh_token } = response.data;
            console.log(response.data)

            token = {
              ...token,
              accessToken: access_token,
              refreshToken: refresh_token,
            };
            Promise.resolve(token);
          } catch (error) {
            Promise.resolve(null);
          }
        }
        if (account?.provider === "credentials") {
          token = {
            ...token,
            accessToken: user.id,
            refreshToken: user.email,
          };
          console.log(token)
          Promise.resolve(token);
        }
      }

      // user was signed in previously, we want to check if the token needs refreshing
      // token has been invalidated, try refreshing it
      if (JwtUtils.isJwtExpired(token.accessToken as string)) {
        const [
          newAccessToken,
          newRefreshToken,
        ] = await NextAuthUtils.refreshToken(token.refreshToken as string);

        if (newAccessToken && newRefreshToken) {
          token = {
            ...token,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000 + 2 * 60 * 60),
          };

          return token;
        }

        // unable to refresh tokens from DRF backend, invalidate the token
        return {
          ...token,
          exp: 0,
        };
      }

      // token valid
      return token;
    },

    async session({ session, token, user } : {
        session: ExtendedSession;
        user: User | AdapterUser;
        token: JWT;
    }) {
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      try {
        const response = await axios.get(
          "https://cheapr.my.id/rest-auth/user/",
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token.accessToken}`
          }
        }
        );

        const { pk, username, email, first_name, last_name, profile } = response.data;
        session.email = email as string;
        session.firstName = first_name as string;
        session.lastName = last_name as string;
        session.username = username as string;
        session.profilePk = profile.id as string;
        session.bio = profile.bio as string;
        session.image = profile.image as string;
        session.imageFromUrl = profile.image_from_url as string;
        session.pk = pk as string;
      } catch (error) {
        console.log("error get user")
      }
      
      return session;
    },
  },
};

export default (req: NextApiRequest, res: NextApiResponse) =>
  NextAuth(req, res, authOptions);