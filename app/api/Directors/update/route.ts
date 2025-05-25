import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/services/dbConfig";
import sql from "mssql";
import validator from "validator";
import moment from "moment";
import { isValidateCompanyRegNumber } from "@/app/constants/sharedconstants";

export const PATCH = async (req: Request) => {
    const formData = await req.formData();
    const fullnames = formData.get('fullnames') as string;
    const phone = formData.get('phone') as string;
    const regNo = formData.get('regNo') as string;
    const email = formData.get('email') as string;
    const percentage=formData.get('percentage') as string;
    const fileDataRess = formData.get(`fileDataRess`) as File | null;
    const fileDataCopyId = formData.get(`fileDataCopyId`) as File | null;
    const tableref = regNo.replace(/[^a-zA-Z0-9]/g, '');
    // Validate the input data
    if (!isValidData(fullnames, regNo, email, phone)) {
        return NextResponse.json(
            { message: "Invalid form submitted" },
            { status: 400 }
        );
    }

    if (!regNo || !fullnames || !email || !phone ) {
        return NextResponse.json({ message: "Invalid data provided" }, { status: 400 });
    }

    // Connect to the database
    const pool = await connectToDatabase();
    let l_update = moment().format("YYYY-MM-DD HH:mm:ss"); //unused ignore
    try {
        if ((fileDataRess && fileDataRess instanceof File) && (fileDataCopyId && fileDataCopyId instanceof File)) {
            const resfileBuffer = Buffer.from(await fileDataRess.arrayBuffer());
            const copyid_fileBuffer = Buffer.from(await fileDataCopyId.arrayBuffer());
            const result = await pool.request()
                .input("fullnames", sql.VarChar, fullnames?.trim())
                .input("email", sql.VarChar, email?.trim())
                .input("percentage",sql.VarChar,percentage?.trim())
                .input('copy_sa_id', sql.VarBinary, copyid_fileBuffer)
                .input('proofRes', sql.VarBinary, resfileBuffer)
                .input("phone", sql.VarChar, phone?.trim())
                .input("proof_Resfilename", sql.VarChar, fileDataRess.name?.trim())
                .input("copy_safilename", sql.VarChar, fileDataCopyId.name?.trim())
                .input("last_update", sql.DateTime, new Date())
                .query(`UPDATE Directors${tableref} 
                 SET fullnames = @fullnames,
                phone=@phone,
                percentage=@percentage,
                proof_Resfilename=@proof_Resfilename,
                copy_safilename=@copy_safilename,
                copy_sa_id=@copy_sa_id,
                proofRes=@proofRes,
                last_update=@last_update
                where email=@email`);

            if (result.rowsAffected) {
                return NextResponse.json(
                    { message: 'updated succesful' },
                    { status: 200 }
                );
            }
        } else if ((fileDataRess && fileDataRess instanceof File)) {
            const resfileBuffer = Buffer.from(await fileDataRess.arrayBuffer());
            // Insert data into the database
            const result = await pool.request()
                .input("fullnames", sql.VarChar, fullnames?.trim())
                .input("email", sql.VarChar, email?.trim())
                .input("percentage",sql.VarChar,percentage?.trim())
                .input('proofRes', sql.VarBinary, resfileBuffer)
                .input("phone", sql.VarChar, phone?.trim())
                .input("proof_Resfilename", sql.VarChar, fileDataRess.name?.trim())
                .input("last_update", sql.DateTime, new Date())
                .query(`UPDATE Directors${tableref} 
                 SET fullnames = @fullnames,
                phone=@phone,
                percentage=@percentage,
                proof_Resfilename=@proof_Resfilename,
                proofRes=@proofRes,
                last_update=@last_update
                where email=@email`);

            if (result.rowsAffected) {
                return NextResponse.json(
                    { message: 'updated succesful' },
                    { status: 200 }
                );
            }
        }
        else if ((fileDataCopyId && fileDataCopyId instanceof File)) {

            const copyid_fileBuffer = Buffer.from(await fileDataCopyId.arrayBuffer());
            const result = await pool.request()
                .input("fullnames", sql.VarChar, fullnames?.trim())
                .input("email", sql.VarChar, email?.trim())
                .input("percentage",sql.VarChar,percentage?.trim())
                .input('copy_sa_id', sql.VarBinary, copyid_fileBuffer)
                .input("phone", sql.VarChar, phone?.trim())
                .input("copy_safilename", sql.VarChar, fileDataCopyId.name?.trim())
                .input("last_update", sql.DateTime, new Date())
                .query(`UPDATE Directors${tableref} 
                 SET fullnames = @fullnames,
                phone=@phone,
                percentage=@percentage,
                copy_safilename=@copy_safilename,
                copy_sa_id=@copy_sa_id,
                last_update=@last_update
                where email=@email`);

            if (result.rowsAffected) {
                return NextResponse.json(
                    { message: 'updated succesful' },
                    { status: 200 }
                );
            }
        }
        else {
            const result = await pool.request()
                .input("fullnames", sql.VarChar, fullnames?.trim())
                .input("email", sql.VarChar, email?.trim())
                .input("percentage",sql.VarChar,percentage?.trim())
                .input("phone", sql.VarChar, phone?.trim())
                .input("last_update", sql.DateTime, new Date())
                .query(`UPDATE Directors${tableref} 
                 SET fullnames = @fullnames,
                phone=@phone,
                percentage=@percentage,
                last_update=@last_update
                where email=@email`);

            if (result.rowsAffected) {
                return NextResponse.json(
                    { message: 'updated succesful' },
                    { status: 200 }
                );
            }
        }
    } catch (error: any) {
        console.error(error);
        return NextResponse.json(
            { message: error?.message },
            { status: 500 }
        );
    } finally {
        pool.close();
    }
};

// Validate form input
const isValidData = (fullnames: string, regNo: string, email: string, phone: string): boolean => {
    const phoneRegex = /^\d{10}$/;
    return (
        validator.isEmail(email.trim()) &&
        fullnames?.trim().length > 0 &&
        phoneRegex.test(phone.trim()) &&
        isValidateCompanyRegNumber(regNo?.trim())
    );
};