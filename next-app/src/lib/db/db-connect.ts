// lib/db/dbConnect.ts
// 참고: https://supern0va.tistory.com/28

import mongoose from "mongoose";

const DB_URI = process.env.DB_URI_TEST || "";

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose
            .set({ debug: true, strictQuery: false })
            .connect(`${DB_URI}`)
            .then((mongoose) => mongoose);
        process.stdout.write("DB Connected");
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

export default dbConnect;
