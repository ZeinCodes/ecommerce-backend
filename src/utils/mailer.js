import { Resend } from "resend";

let client = null;

// Created on first use so the app can start (and tests can run)
// without RESEND_API_KEY being set.
const getClient = () => {
    if (!client) {
        const apiKey = process.env.RESEND_API_KEY;

        if (!apiKey) {
            throw new Error("RESEND_API_KEY is not set");
        }

        client = new Resend(apiKey);
    }

    return client;
};

// Never throws: failures are logged and reported as `false`, so callers can
// keep their responses identical whether or not the email went out.
export const sendMail = async ({ to, subject, html }) => {
    try {
        const { error } = await getClient().emails.send({
            from: process.env.MAIL_FROM,
            to,
            subject,
            html
        });

        if (error) {
            console.error(`Failed to send "${subject}" email:`, error.message);
            return false;
        }

        return true;
    } catch (error) {
        console.error(`Failed to send "${subject}" email:`, error.message);
        return false;
    }
};

export const verificationEmailHtml = (token) => `
    <p>Click the link below to verify your email:</p>
    <a href="${process.env.FRONTEND_URL}/verify-email?token=${token}">Verify your email</a>
    <p>This link expires in 24 hours.</p>
`;

export const passwordResetEmailHtml = (token) => `
    <p>Click the link below to reset your password:</p>
    <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}">Reset your password</a>
    <p>This link expires in 30 minutes. If you didn't request this, you can ignore this email.</p>
`;