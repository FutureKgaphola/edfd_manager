import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/services/dbConfig";
import sql from "mssql";

export const PATCH = async (req: Request) => {
    const formData = await req.formData();

    const id = formData.get('id') as string;
    const user_email = formData.get('user_email') as string;
    const first_name = formData.get('first_name') as string;
    const last_name = formData.get('last_name') as string;
    const phone = formData.get('phone') as string;
    const saId = formData.get('saId') as string;
    const filename = formData.get('filename') as string;

    const SpouceName = formData.get('SpouceName') as string;
    const SpouceId = formData.get('SpouceId') as string;
    const SpoucePhone = formData.get('SpoucePhone') as string;
    const SpouceEmail = formData.get('SpouceEmail') as string;
    const SpouceIDfilename = formData.get('SpouceIDfilename') as string;

    const marital_status = formData.get('marital_status') as string;
    const marialDocfilename = formData.get('maritalDocfilename') as string;

    // Files
    const fileEntry1 = formData.get('file0'); //holderIDfile
    const fileEntry2 = formData.get('file1');//maritalfile
    const fileEntry3 = formData.get('file2');//SpouceIDfile

    const holderIDfile = fileEntry1 instanceof File ? Buffer.from(await fileEntry1.arrayBuffer()) : null;
    const Maritalfile = fileEntry2 instanceof File ? Buffer.from(await fileEntry2.arrayBuffer()) : null;
    const SpouceIDfile = fileEntry3 instanceof File ? Buffer.from(await fileEntry3.arrayBuffer()) : null;

    const pool = await connectToDatabase();

    try {
        const request = pool.request();

        // Always-updated fields
        request
            .input("id", sql.Int, id)
            .input("user_email", sql.VarChar, user_email?.trim() || null)
            .input("first_name", sql.VarChar, first_name?.trim() || null)
            .input("last_name", sql.VarChar, last_name?.trim() || null)
            .input("phone", sql.VarChar, phone?.trim() || null)
            .input("holdersaId", sql.VarChar, saId?.trim() || null)
            .input("SpouceName", sql.VarChar, SpouceName?.trim() || null)
            .input("SpouceId", sql.VarChar, SpouceId?.trim() || null)
            .input("SpoucePhone", sql.VarChar, SpoucePhone?.trim() || null)
            .input("SpouceEmail", sql.VarChar, SpouceEmail?.trim() || null)
            .input("marital_status", sql.VarChar, marital_status?.trim() || null)
            .input("last_update", sql.DateTime, new Date());

        // File-related inputs and dynamic query construction
        let updateFields = `
            first_name = @first_name,
            last_name = @last_name,
            phone = @phone,
            holdersaId = @holdersaId,
            SpouceName = @SpouceName,
            SpouceId = @SpouceId,
            SpoucePhone = @SpoucePhone,
            SpouceEmail = @SpouceEmail,
            marital_status = @marital_status,
            last_update = @last_update
        `;

        if (holderIDfile) {
            request.input("holderIDcopy", sql.VarBinary, holderIDfile);
            request.input("holderIDfilename", sql.VarChar, filename?.trim() || null);
            updateFields += `,
                holderIDcopy = @holderIDcopy,
                holderIDfilename = @holderIDfilename
            `;
        }

        if (SpouceIDfile) {
            request.input("SpouceIDcopy", sql.VarBinary, SpouceIDfile);
            request.input("SpouceIDfilename", sql.VarChar, SpouceIDfilename?.trim() || null);
            updateFields += `,
                SpouceIDcopy = @SpouceIDcopy,
                SpouceIDfilename = @SpouceIDfilename
            `;
        }

        if (Maritalfile) {
            request.input("maritalDocument", sql.VarBinary, Maritalfile);
            request.input("maritalDocfilename", sql.VarChar, marialDocfilename?.trim() || null);
            updateFields += `,
                maritalDocument = @maritalDocument,
                maritalDocfilename = @maritalDocfilename
            `;
        }

        const query = `
            UPDATE LeadContact SET ${updateFields}
            WHERE id = @id AND user_email = @user_email
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
