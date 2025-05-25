import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/services/dbConfig";
import sql from "mssql";
import validator from "validator";
import { isValidateCompanyRegNumber } from "@/app/constants/sharedconstants";
import moment from 'moment';
export const POST = async (req: Request) => {
    let timeRef= moment().format('hh:mm:ss');
    let transaction: sql.Transaction | null = null;
    let regCopy;
    try {
        const { user_email,companyName,districtId, regNo, amount, loanDocs } = await req.json();
         regCopy=regNo;
        const tableref = regNo.replace(/[^a-zA-Z0-9]/g, '');
        if (!isValidData(user_email,companyName, regNo, amount,districtId, loanDocs)) {
            return NextResponse.json(
                { message: "Invalid form submitted" },
                { status: 400 }
            );
        }

        const pool = await connectToDatabase();
        transaction = pool.transaction();
        await transaction.begin();

        const baseRequest = transaction.request();
        baseRequest.input("user_email", sql.VarChar, user_email);
        baseRequest.input("regNo", sql.VarChar, regNo);

        

        // 2. Reattach inputs to the new request for data copying
        const insertRequest = transaction.request();
        insertRequest.input("user_email", sql.VarChar, user_email);
        insertRequest.input("regNo", sql.VarChar, regNo);

        // log the application 
        const applicationRef = `EDFD-${timeRef}-${tableref}`;
        const applicationReq = transaction.request();
        applicationReq.input('user_email', sql.VarChar, user_email);
        applicationReq.input("regNo", sql.VarChar, regNo);
        applicationReq.input("districtId",sql.VarChar,districtId);
        applicationReq.input("amount", sql.VarChar, amount);
        applicationReq.input("status",sql.VarChar, 'open');
        applicationReq.input("outcome",sql.VarChar, '');
        applicationReq.input("stageAt",sql.VarChar, '1');
        applicationReq.input("message",sql.VarChar, 'Assesment of your submitted document is underway.');
        applicationReq.input("loanDocs", sql.VarChar, loanDocs);
        applicationReq.input("applicationRef", sql.VarChar, applicationRef);
        applicationReq.input('companyName', sql.VarChar, companyName);
        await applicationReq.query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Applications' AND xtype='U')
        BEGIN
            CREATE TABLE Applications (
            id INT IDENTITY(1,1) PRIMARY KEY,
            user_email VARCHAR(255) NOT NULL,
            regNo VARCHAR(255) NOT NULL UNIQUE,
            districtId VARCHAR(15) NOT NULL,
            status VARCHAR(255) NOT NULL,
            outcome VARCHAR(255) NOT NULL,
            stageAt VARCHAR(255) NOT NULL,
            message VARCHAR(255) NOT NULL,
            companyName VARCHAR(255) NOT NULL,
            amount VARCHAR(255) NOT NULL,
            loanDocs VARCHAR(255) NOT NULL,
            applicationRef VARCHAR(255) NOT NULL,
            create_date DATETIME NOT NULL DEFAULT GETDATE(),
            last_update DATETIME NOT NULL DEFAULT GETDATE()
            );
        END
        INSERT INTO Applications (user_email,companyName, regNo,districtId,status,outcome,stageAt,message,amount, loanDocs, applicationRef)
            VALUES (@user_email,@companyName, @regNo,@districtId, @status,@outcome, @stageAt, @message, @amount, @loanDocs, @applicationRef);
        `
        );

        await transaction.commit();
        return NextResponse.json(
            { message: "Application Submitted" },
            { status: 201 }
        );

    } catch (error: any) {
        console.error("Transaction error:", error);
        console.log("Something went wrong with your profile. Make sure your profile is complete before applying");

        if (transaction) await transaction.rollback();
        if (error.message.includes("Violation of UNIQUE KEY constraint") || error.message.includes("duplicate key")) {
            return NextResponse.json({ message: `An Application already exist using this compary registration. ${regCopy || ''}` }, { status: 409 });
        }
        return NextResponse.json(
            { message: "Internal server error", othermessage: 'Something went wrong with your profile. Make sure your profile is complete before applying' },
            { status: 500 }
        );
    }
};

const isValidData = (
    user_email: string,
    companyName:string,
    regNo: string,
    amount: string,
    districtId: string,
    loanDocs: string,
): boolean => {
    return (
        validator.isEmail(user_email?.trim()) &&
        isValidateCompanyRegNumber(regNo?.trim()) &&
        loanDocs?.trim()?.length > 0 &&
        companyName?.trim()?.length > 0 &&
        validator.isNumeric(districtId?.trim()) &&
        validator.isNumeric(amount?.trim())
    );
};
