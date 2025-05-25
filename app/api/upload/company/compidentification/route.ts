import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/services/dbConfig";
import sql from "mssql";

export const PATCH = async (req: Request) => {
    const formData = await req.formData();
    const user_email = formData.get('user_email') as string;
    const TradeName = formData.get('TradeName') as string;
    const regNo = formData.get('regNo') as string;
    const TaxNo = formData.get('TaxNo') as string;
    const VatNo = formData.get('VatNo') as string;
    const id =formData.get('id') as string;

    const pool = await connectToDatabase();

    try {
        const request = pool.request();

        // Always-updated fields
        request
            .input("regNo", sql.VarChar, regNo?.trim() || null)
            .input("user_email", sql.VarChar, user_email?.trim() || null)
            .input("TradeName", sql.VarChar, TradeName?.trim() || null)
            .input("TaxNo", sql.VarChar, TaxNo?.trim() || null)
            .input("VatNo", sql.VarChar, VatNo?.trim() || null)
            .input("last_update", sql.DateTime, new Date());

        // File-related inputs and dynamic query construction
        let updateFields = `
            TradeName = @TradeName,
            TaxNo = @TaxNo,
            VatNo = @VatNo,
            last_update = @last_update
        `;

        const query = `
            UPDATE CompaniesIdentification SET ${updateFields}
            WHERE regNo = @regNo AND user_email = @user_email
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
