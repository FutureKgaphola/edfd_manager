import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/services/dbConfig";
import sql from "mssql";

export const PATCH = async (req: Request) => {
    const pool = await connectToDatabase();
    const { id,empno } = await req.json();
    console.log("ID:", id);
    console.log("empno:", empno);
    try {
        const rows = await pool.request()
            .input("id", sql.Int, parseInt(id))
            .input("empno", sql.VarChar(50),empno)
            .query(
                "UPDATE Applications SET empno = @empno WHERE id = @id"
            );
        if (rows.rowsAffected[0] === 0) {
            return NextResponse.json(
                { message: "No application found" },
                { status: 404 }
            );
        }
        const updatedRows = await pool.request()
            .input("id", sql.Int, parseInt(id))
            .query("SELECT * FROM Applications WHERE id = @id");
        const updatedApplication = updatedRows.recordset[0];
        if (!updatedApplication) {
            return NextResponse.json(
                { message: "No application found" },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { message: "Loan Originator Assigned Successfully", updatedApplication },
            { status: 200 }
        );

    } catch (error: any) {
        return NextResponse.json(
            { message: error?.message || "Internal server error" },
            { status: 500 }
        );
    }
};
