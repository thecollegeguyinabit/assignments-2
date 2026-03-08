import NextAuth from "next-auth";
import Credentials  from "next-auth/providers/credentials";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";

export const admin = { id: "1", name: "John Doe", email: "johndoe@example.com", password: "abcd1234"};

export const {handlers, signIn, signOut, auth} = NextAuth({
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID as string,
            clientSecret: process.env.AUTH_GOOGLE_SECRET as string
        }), 
        Github({
            clientId: process.env.AUTH_GITHUB_ID as string,
            clientSecret: process.env.AUTH_GITHUB_SECRET as string
        }),
        Credentials({
            credentials: {
                email: {
                    type: "email",
                    label: "Email",
                    placeholder: "johndoe@example.com"
                },
                password: {
                    type: "password",
                    label: "Password"
                },
            },
            authorize: (credentials) => {
                let user = null;
                if(credentials?.email === admin.email && credentials?.password === admin.password){
                    user = admin;
                }
                return user;
            }
        })
    ]
});