"use server"

import { Avatars, ID, Query } from "node-appwrite";
import { createAdminClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { string, unknown } from "zod";
import { parseStringify } from "../utils";

const getUserByEmail = async (email: string) => {
    const { databases } = await createAdminClient();

    const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        [Query.equal("email", [email])],
    );

    return result.total > 0 ? result.documents[0] : null;
};

const handleError = (error: unknown, message: string) => {
    console.log(error, message);
    throw error;

}

const sendEmailOTP = async ({ email }: { email: string }) => {
    const { account } = await createAdminClient();

    try {
        const session = await account.createEmailToken(ID.unique(), email);

        return session.userId;
    } catch (error) {
        handleError(error, "Filed to send email OTP");
    }
}

export const createAccount = async ({ fullName, email }: { fullName: string; email: string }) => {
    const existingUser = await getUserByEmail(email);
    const accountId = await sendEmailOTP({ email });
    if (!accountId) throw new Error("Failed to send an OTP");
    if (!existingUser) {
        const { databases } = await createAdminClient();

        await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.usersCollectionId,
            ID.unique(),
            {
                fullName,
                email,
                avatar: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIALwAyAMBIgACEQEDEQH/xAAaAAEAAwEBAQAAAAAAAAAAAAAAAwQFAgEH/8QAMRABAAIBAgUCAggHAAAAAAAAAAECAwQREiExQVEFgSLBEzJSYWJyobEUI0JTcZHx/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAH/xAAVEQEBAAAAAAAAAAAAAAAAAAAAEf/aAAwDAQACEQMRAD8A+qAKgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPJtFa72mIjzKC+tw1nlM2/wCwKn8fX+3b/bquuxf1ReAWRHTPiyfVyR78knv1AAAAAAAAAAAAAAAAAAAVM+s4ZmuOItPee0PNdmmP5VOW8bzMKO5B1fJfJbe9pn9nIEAAgLWDWTXauXnWO8dVUINmJi1Yms7xPSXqj6flninHPeOS8AAAAAAAAAAAAAAAfIcZrbYck/hkGXmv8ASZrX8y4BQAAAAABJpr8Ooxz98Q1mPj2jJSZ6RaGwgAAAAAAAAAAAAAAI9RG+DJ54ZSOMkx9HaJmI3jbmDIAUAAAAAAG1HRjRG8xDYrO8bxMTE+EHoAAAAAAAAAAAAACr6hG+CPzRutINZHFp7bdtpBmAKAAAAAADT0Ubaenv+7Ma2CvDgxxPWIQSAAAAAAAAAAAAAAOb14sdqx1tXZ0Ax8mK+KYjJGzle9Rp8NLx2n/iitAAAAAAEmLDfLPwR35y1tlfQ1munj8U7+3ZYQAAAAAAAAAAAAAAAAcZcf0uOaeY5fdLJvWaWmtuVo5TDZZ3qERGeNu9fmCsAoAAOsdJyZIpHWZ23crXp8ROa35fmC/FYiIiI5RGz0EAAAAAAAAAAAAAAACd/YDntyZmuvFs8bTvwx1eZ9TfJaY32rE9KoSAAoAALGhtFdRtM7RavVXNwbXPbmMvBqb47RG+9ZnpZqRv7IAAAAAAAAAAA8mdomZ2iI6zPRBfW4a9Jm8+KgsHbft5nlChfX3n6lYrHmVfJlyZJ+O8yQX8urx499p4p8Qp5tTky8p5V+zCEIACgAAAAAAmw6nJi5Rzr9mUIkGli1ePJtvPDPiVjtv28xzhiu8eXJjn4LzBBrihTX3j69YtHmE9Nbht1maT4sQWB5E7xExtMT0mOj0AABxlyRipN79I/V2oeo2njrHaIiQQZs9s1ufTtWOyMCAAoAAAAAAAAAAAAAAAAkw57Ybcunes92niyRlpF6dJ/RkLfp1p47R2mJlBfAB//9k=',
                accountId,
            }
        )
    }
    return parseStringify({accountId});
};