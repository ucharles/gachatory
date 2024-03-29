import NextAuth from "next-auth";
import { options } from "./options";
import { NextApiRequest, NextApiResponse } from "next";

const handler = NextAuth(options);

export { handler as GET, handler as POST };
