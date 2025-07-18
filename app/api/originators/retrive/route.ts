import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/services/dbConfig";
import sql from "mssql";

export const GET = async () => {
  const pool = await connectToDatabase();

  try {
    const request = new sql.Request(pool);

    // Ensure table exists
    const createTableSQL = `
      IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_NAME = 'Originators' AND TABLE_SCHEMA = 'dbo'
      )
      BEGIN
        CREATE TABLE dbo.Originators (
          id INT IDENTITY(1,1) PRIMARY KEY,
          fullnames VARCHAR(255) NOT NULL,
          empno VARCHAR(100) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          districtId VARCHAR(100) NOT NULL,
          create_date DATETIME NOT NULL
        )
      END
    `;
    await request.query(createTableSQL);

    // Query for all loan originators
    const result = await request.query(`
      SELECT id, fullnames, empno, email, districtId, create_date
      FROM Originators
      ORDER BY create_date DESC
    `);

    return NextResponse.json(
      { originators: result.recordset },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Database error:", error);

    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await pool.close();
  }
};