// pages/api/test/route.ts
// 참고: https://supern0va.tistory.com/28
// NextJS 13 버전부터는 NextResponse를 사용해야 한다.
// HTTP Method마다 다른 함수를 사용해야 한다.
// 이전 버전처럼 하나의 Handler를 사용하여 if문으로 분기할 수 없다.
// https://nextjs.org/docs/app/building-your-application/routing/route-handlers#request-body

// import { NextResponse } from "next/server";
// import Test from "../../../lib/test/test.model";
// import dbConnect from "../../../lib/db/db-connect";
// import { getNextSequenceValue } from "../../../lib/counter/counter.model";

// export async function GET(request: Request) {
//     try {
//         dbConnect();
//         const tests = Test;

//         const allTests = await tests.find({});

//         return NextResponse.json(allTests, { status: 200 });
//     } catch (error) {
//         console.error(error);
//         return NextResponse.json(
//             { error: "Internal server error" },
//             { status: 500 }
//         );
//     }
// }

// export async function POST(request: Request) {
//     try {
//         dbConnect();
//         const tests = Test;
//         const { title, content } = await request.json();

//         const testId = await getNextSequenceValue("testId");
//         const test = new tests({ testId, title, content });
//         await test.save();
//         return NextResponse.json(
//             { message: "Test created successfully" },
//             { status: 200 }
//         );
//     } catch (error) {
//         console.error(error);
//         return NextResponse.json(
//             { error: "Internal server error" },
//             { status: 500 }
//         );
//     }
// }

// Before NextJS 13
// export default async function handler(
//     req: NextApiRequest,
//     res: NextApiResponse
// ) {
//     if (req.method === "GET") {
//         try {
//             dbConnect();
//             const tests = Test;

//             const allTests = await tests.find({});

//             res.status(200).json(allTests);
//         } catch (error) {
//             console.error(error);
//             res.status(500).json({ message: "Internal server error" });
//         }
//     } else if (req.method === "POST") {
//         try {
//             dbConnect();
//             const tests = Test;
//             const { title, content } = req.body;
//             const testId = await getNextSequenceValue("testId");
//             const test = new tests({ testId, title, content });
//             await test.save();
//             res.status(200).json({ message: "Test created successfully" });
//         } catch (error) {
//             console.error(error);
//             res.status(500).json({ message: "Internal server error" });
//         }
//     }
// }
