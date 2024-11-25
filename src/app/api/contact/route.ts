import nodemailer from "nodemailer";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const request = await req.json();
    const gmailUser = process.env.GMAIL_USER;
    const appPass = process.env.GMAIL_APP_PASS;

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
        <p>【メッセージ内容】</p>
        <p>${request.message}</p>
        <p>【メールアドレス】</p>
        <p>${request.email}</p>
        `,
    };
    try {
        await transporter.sendMail(toHostMailData);
    } catch (error) {
        console.error(error);
        return new Response("Failed to send mail ", {
            status: 400,
        });
    }
    return new Response("Success!", {
        status: 200,
    });
}
