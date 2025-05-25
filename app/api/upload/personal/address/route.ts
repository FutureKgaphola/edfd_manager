import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/services/dbConfig";
import sql from "mssql";

export const PATCH = async (req: Request) => {
    const formData = await req.formData();

    const id = formData.get('id') as string;
    const user_email = formData.get('user_email') as string;
    const physical = formData.get('physical') as string;
    const postal = formData.get('postal') as string;
    const filename = formData.get('filename') as string;

    // Files
    const fileEntry1 = formData.get('file0'); //holderIDfile

    const proofAddress = fileEntry1 instanceof File ? Buffer.from(await fileEntry1.arrayBuffer()) : null;

    const pool = await connectToDatabase();

    try {
        const request = pool.request();

        // Always-updated fields
        request
            .input("id", sql.Int, id)
            .input("holderEmail", sql.VarChar, user_email?.trim() || null)
            .input("physical", sql.VarChar, physical?.trim() || null)
            .input("postal", sql.VarChar, postal?.trim() || null)
            .input("last_update", sql.DateTime, new Date());

        // File-related inputs and dynamic query construction
        let updateFields = `
            physicalAddress = @physical,
            postal = @postal,
            last_update = @last_update
        `;

        if (proofAddress) {
            request.input("proofAddress", sql.VarBinary, proofAddress);
            request.input("filename", sql.VarChar, filename?.trim() || null);
            updateFields += `,
                proofAddress = @proofAddress,
                filename = @filename
            `;
        }

        const query = `
            UPDATE LeadAddress SET ${updateFields}
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
