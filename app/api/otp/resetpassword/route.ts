
import { NextResponse } from "next/server";
import sql from "mssql";
import bcrypt from "bcrypt";
import validator from "validator";
import { connectToDatabase } from "@/app/services/dbConfig";

export const POST = async (req: Request) => {
    let pool: sql.ConnectionPool | null = null;
    try {
        pool = await connectToDatabase();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        const result = await req.json();

        const { email, otp, newpassword } = result;

        const error = isError(email, newpassword, otp);
        if (error !== "No error") {
            return NextResponse.json({ message: error, success: false }, { status: 400 });
        }

        const otpValid = await pool.request()
            .input("email", sql.VarChar, email.trim())
            .input("otp", sql.VarChar, otp.trim())
            .query(`SELECT * FROM OTPRequests WHERE email = @email AND otp = @otp`);

        if (otpValid.recordset.length === 0) {
            return NextResponse.json({ message: "Invalid OTP", success: false }, { status: 400 });
        }
        const updateSuccess = await updateUserPassword(transaction, email, newpassword);
        if (updateSuccess) {
            // remove OTP from the database
            await pool.request()
                .input("email", sql.VarChar, email?.trim())
                .input("otp", sql.VarChar, otp?.trim())
                .query(`
                DELETE FROM OTPRequests
                WHERE email = @email AND otp = @otp
            `);
        }
        if (!updateSuccess) {
            return NextResponse.json(
                { message: "Failed to update password", success: false },
                { status: 500 }
            );
        }
        return NextResponse.json(
            {
                message: "Password reset successfully.",
                success: true
            },
            { status: 200 }
        );
    } catch (err) {
        console.error("Password reset error:", err);
        return NextResponse.json({ message: "Internal Server Error", success: false }, { status: 500 });
    } finally {
        pool?.close();
    }
}
const updateUserPassword = async (transaction: any, email: string, newPassword: string) => {

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const request = new sql.Request(transaction);

        const result = await request
            .input("email", sql.VarChar, email)
            .input("hashedPassword", sql.VarChar, hashedPassword)
            .query(`
          UPDATE Managers
          SET password = @hashedPassword
          WHERE user_email = @email
        `);

        if (result.rowsAffected[0] === 0) {
            await transaction.rollback();
            return false;
        }

        await transaction.commit();
        return true;

    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error("SQL Server transaction failed:", error);
        return false;
    }
};

const isError = (
    user_email: string, password: string, otp: string
): string => {

    const isStrongPassword = password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /\d/.test(password);

    if (!isStrongPassword) {
        return "Password is not strong enough"
    }
    if (!validator.isEmail(user_email.trim())) {
        return "Email is not valid";
    }

    if (!validator.isNumeric(otp?.trim()) || otp?.trim().length !== 6) {
        return "OTP is not valid";
    }

    return "No error";
};