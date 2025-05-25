import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/services/dbConfig";
import sql from "mssql";

export const GET = async (req: Request) => {
  try {
    const pool = await connectToDatabase();
    const url = new URL(req.url);
    const regno: string = url.searchParams.get("regno")?.trim() || "";
    const tableref = regno.replace(/[^a-zA-Z0-9]/g, '');
    // Query the database for the user by email
    const rows = await pool.request()
      .input("regno", sql.VarChar, tableref?.trim())
      .input("reg", sql.VarChar, regno?.trim())
      .query(`SELECT * FROM Directors${tableref} where regNo=@reg`);

    // Check if the companies were found
    if (rows.recordset.length === 0) {
      return NextResponse.json(
        { message: 'Directors(s) not found', directors: [] },
        { status: 200 }
      );
    }
    const directors = rows.recordset;
    return NextResponse.json(
      { directors: directors },
      { status: 200 }
    );

  } catch (error: any) {
    if (error?.code === 'EREQUEST' && error?.message.includes("Invalid object name 'Directors")) {
      return NextResponse.json(
        { message: 'Directors(s) not found', directors: [] },
        { status: 200 }
      );
    }
    return NextResponse.json(
      { message: error?.message },
      { status: 500 }
    );
  }
}