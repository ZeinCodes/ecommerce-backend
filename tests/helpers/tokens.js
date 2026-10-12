import { generateAccessToken, generateRefreshToken } from "../../src/utils/jwt.js";

// Valid v4 UUIDs (the API validates route params and bodies as UUIDs)
export const USER_ID = "11111111-1111-4111-8111-111111111111";
export const OTHER_USER_ID = "22222222-2222-4222-8222-222222222222";
export const ADMIN_ID = "33333333-3333-4333-8333-333333333333";
export const SOME_ID = "44444444-4444-4444-8444-444444444444";

export const userToken = (id = USER_ID) =>
    generateAccessToken({ id, role: "user" });

export const adminToken = (id = ADMIN_ID) =>
    generateAccessToken({ id, role: "admin" });

export const refreshTokenFor = (id = USER_ID, role = "user") =>
    generateRefreshToken({ id, role });

export const bearer = (token) => ({ Authorization: `Bearer ${token}` });
