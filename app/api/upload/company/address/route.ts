import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/services/dbConfig";
import sql from "mssql";
import validator from "validator";

export const PATCH = async (req: Request) => {
    const formData = await req.formData();

    const id = formData.get('id') as string;
    const physical = formData.get('physical') as string;
    const postal = formData.get('postal') as string;
    const user_email = formData.get('user_email') as string;
    const property = formData.get('property') as string;
    const proof_filename=formData.get('proof_filename') as string;
    const lease_filename=formData.get('lease_filename') as string;
    const districtId =formData.get('districtId') as string;
    console.log(districtId);
    // Files
    const fileEntry1 = formData.get('file0'); 
    const fileEntry2 = formData.get('file1');

    const proofress = fileEntry1 instanceof File ? Buffer.from(await fileEntry1.arrayBuffer()) : null;
    const leaseAgreement = fileEntry2 instanceof File ? Buffer.from(await fileEntry2.arrayBuffer()) : null;

    const pool = await connectToDatabase();

    try {
        if (!id || !validator.isNumeric(districtId.trim()) ) {
            return NextResponse.json({ message: "Invalid data provided" }, { status: 400 });
        }
        const request = pool.request();

        // Always-updated fields
        request
            .input("id", sql.Int, id)
            .input("physicalAddress", sql.VarChar, physical?.trim() || null)
            .input("postal", sql.VarChar, postal?.trim() || null)
            .input("property", sql.VarChar, property?.trim() || null)
            .input("holderEmail", sql.VarChar, user_email?.trim() || null)
            .input("last_update", sql.DateTime, new Date())
            .input("districtId", sql.VarChar, districtId?.trim() || null);

        // File-related inputs and dynamic query construction
        let updateFields = `
            physicalAddress = @physicalAddress,
            postal = @postal,
            leased = @property,
            last_update = @last_update,
            districtid=@districtId
        `;

        if (proofress) {
            request.input("proofAddress", sql.VarBinary, proofress);
            request.input("proof_filename", sql.VarChar, proof_filename?.trim() || null);
            updateFields += `,
                proofAddress = @proofAddress,
                proof_filename = @proof_filename
            `;
        }

        if (leaseAgreement) {
            request.input("leaseAgreement", sql.VarBinary, leaseAgreement);
            request.input("lease_filename", sql.VarChar, lease_filename?.trim() || null);
            updateFields += `,
                leaseAgreement = @leaseAgreement,
                lease_filename = @lease_filename
            `;
        }
        
        const query = `
            UPDATE CompaniesAddress SET ${updateFields}
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

