import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/services/dbConfig";
import sql from "mssql";
import validator from "validator";

export const POST = async (req: Request) => {
    try {
        const { email } = await req.json();

        if (!isValidData(email)) {
            return NextResponse.json({ message: "Invalid email" }, { status: 400 });
        }

        const pool = await connectToDatabase();
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await pool.request()
            .input("email", sql.VarChar, email.trim())
            .input("otp", sql.VarChar, otp)
            .query(`
                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='OTPRequests' AND xtype='U')
                BEGIN
                    CREATE TABLE OTPRequests (
                        id INT IDENTITY(1,1) PRIMARY KEY,
                        email VARCHAR(255) NOT NULL UNIQUE,
                        otp VARCHAR(6) NOT NULL,
                        created_at DATETIME NOT NULL DEFAULT GETDATE()
                    );
                END`);
                await pool.request()
                .input("email", sql.VarChar, email.trim())
                .input("otp", sql.VarChar, otp)
                .query(`
                    MERGE OTPRequests AS target
                    USING (SELECT @email AS email) AS source
                    ON target.email = source.email
                    WHEN MATCHED THEN 
                        UPDATE SET otp = @otp, created_at = GETDATE()
                    WHEN NOT MATCHED THEN
                        INSERT (email, otp, created_at) VALUES (@email, @otp, GETDATE());
                `);
            
        return NextResponse.json({ message: "Created an OTP successfully", otp }, { status: 200 });

    } catch (error: any) {
        console.error(error);
        return NextResponse.json(
            { message: "Internal server error. Please try again later." },
            { status: 500 }
        );
    }
};

const isValidData = (email: string): boolean => {
    return validator.isEmail(email.trim()) && email.trim().length > 0;
};
