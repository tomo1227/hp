import nodemailer from "nodemailer";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const request = await req.json();
    const gmailUser = process.env.NEXT_PUBLIC_GMAIL_USER;
    const appPass = process.env.NEXT_PUBLIC_GMAIL_APP_PASS;

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        auth: {
            user: gmailUser,
            pass: appPass,
        },
    });
    const toHostMailData = {
        from: request.email,
        to: `${gmailUser}`,
        subject: `【tomokiota.com】${request.title}`,
        text: `${request.message} Send from ${request.email}`,
        html: `
        <p>【名前】</p>
        <p>${request.name}</p>
        <p>【メールアドレス】</p>
        <p>${request.email}</p>
        <p>【メッセージ内容】</p>
        <p>${request.message}</p>
        `,
    };
    try {
        await transporter.sendMail(toHostMailData);
    } catch (error) {
        return new Response("${gmailUser}, ${appPass}, ${toHostMailData}", {
            status: 400,
        });
    }
    return new Response("Success!", {
        status: 200,
    });
}
