// @types/mongodb.ts
// 참고: https://supern0va.tistory.com/28

import { Mongoose } from "mongoose";

/* eslint-disable no-var */

// global variable to store the connection
declare global {
    var mongoose: {
        promise: Promise<Mongoose> | null;
        conn: Mongoose | null;
    };
}
