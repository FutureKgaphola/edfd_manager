import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/services/dbConfig";
import sql from "mssql";

export const PATCH = async (req: Request) => {
  const pool = await connectToDatabase();

  let requestData;
  try {
    requestData = await req.json();
   
  } catch (parseError) {
    console.error("Failed to parse JSON:", parseError);
    return NextResponse.json(
      { message: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  const { id, empno, managerId } = requestData;

  if (!id || !empno || !managerId) {
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    // Update the application
    const updateResult = await pool
      .request()
      .input("id", sql.Int, parseInt(id))
      .input("empno", sql.VarChar(50), empno)
      .input("managerId", sql.VarChar(11), managerId)
      .input("last_update", sql.DateTime, new Date())
      .query(
        "UPDATE Applications SET empno = @empno, managerId = @managerId, last_update=@last_update WHERE id = @id"
      );

    if (updateResult.rowsAffected[0] === 0) {
      return NextResponse.json(
        { message: "No application found" },
        { status: 404 }
      );
    }

    // Retrieve the updated record
    const updatedRows = await pool
      .request()
      .input("id", sql.Int, parseInt(id))
      .query("SELECT * FROM Applications WHERE id = @id");

    const updatedApplication = updatedRows.recordset[0];

    if (!updatedApplication) {
      return NextResponse.json(
        { message: "No application found after update" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Loan Originator Assigned Successfully",
        updatedApplication
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Database error:", error);
    return NextResponse.json(
      { message: error?.message || "Internal server error" },
      { status: 500 }
    );
  } finally {
    await pool.close();
  }
};
