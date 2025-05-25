import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/services/dbConfig";
import sql from "mssql";

export const DELETE = async (req: Request) => {
    let transaction: sql.Transaction | null = null;
    try {
        
        const url = new URL(req.url);
        const regno: string = url.searchParams.get("regno")?.trim() || "";
        const id: string = url.searchParams.get("id")?.trim() || "";
        const tableref = regno.replace(/[^a-zA-Z0-9]/g, '');

        if (!regno || !id) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        const pool = await connectToDatabase();
            transaction = pool.transaction();
            await transaction.begin();

        const request = new sql.Request(transaction);
        const result = await request
            .input("regno", sql.VarChar, regno)
            .input("id", sql.Int, parseInt(id))
            .query(`
                DELETE FROM Directors${tableref}
                WHERE regNo = @regno AND id = @id
            `);

        await transaction.commit();

        return NextResponse.json({
            message: "Record deleted successfully",
            rowsAffected: result.rowsAffected[0],
        });
    } catch (error:any) {
        if (transaction) await transaction.rollback();

        return NextResponse.json(
            { error: "Failed to delete record", details: error.message },
            { status: 500 }
        );
    }
};
