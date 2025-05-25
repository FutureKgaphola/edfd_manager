import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/services/dbConfig";
import sql from "mssql";

export const PATCH = async (req: Request) => {
    const formData = await req.formData();

    const id = formData.get('id') as string;
    const user_email = formData.get('user_email') as string;
    const bank = formData.get('bank') as string;
    const branch = formData.get('branch') as string;
    const branchcode = formData.get('branchcode') as string;
    const AccountNumber = formData.get('AccountNumber') as string; 
    const AccountHolderName = formData.get('AccountHolderName') as string; 
    const AccountType = formData.get('AccountType') as string; 
    const filename = formData.get('filename') as string;

    // Files
    const fileEntry1 = formData.get('file0'); //holderIDfile

    const proofBank = fileEntry1 instanceof File ? Buffer.from(await fileEntry1.arrayBuffer()) : null;

    const pool = await connectToDatabase();

    try {
        const request = pool.request();

        // Always-updated fields
        request
            .input("id", sql.Int, id)
            .input("holderEmail", sql.VarChar, user_email?.trim() || null)
            .input("bank", sql.VarChar, bank?.trim() || null)
            .input("branch", sql.VarChar, branch?.trim() || null)
            .input("branchcode", sql.VarChar, branchcode?.trim() || null)
            .input("AccountNumber", sql.VarChar, AccountNumber?.trim() || null)
            .input("AccountHolderName", sql.VarChar, AccountHolderName?.trim() || null)
            .input("AccountType", sql.VarChar, AccountType?.trim() || null)
            .input("last_update", sql.DateTime, new Date());

        // File-related inputs and dynamic query construction
        let updateFields = `
            bankName = @bank,
            accountNumber = @AccountNumber,
            branchCode = @branchcode,
            branchName = @branch,
            accountType = @AccountType,
            accountHolder = @AccountHolderName,
            last_update = @last_update
        `;

        if (proofBank) {
            request.input("proofBank", sql.VarBinary, proofBank);
            request.input("filename", sql.VarChar, filename?.trim() || null);
            updateFields += `,
                proofBank = @proofBank,
                filename = @filename
            `;
        }

        const query = `
            UPDATE CompaniesBanking SET ${updateFields}
            WHERE id = @id AND holderEmail = @holderEmail
        `;

        const result = await request.query(query);

        if (result.rowsAffected[0] > 0) {
            return NextResponse.json({ message: 'updated' }, { status: 200 });
        } else {
            return NextResponse.json({ message: 'No record found to update' }, { status: 404 });
        }
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    } finally {
        await pool.close();
    }
};
