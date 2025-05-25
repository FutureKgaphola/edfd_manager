import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/services/dbConfig";
import sql from "mssql";

export const GET=async(req:Request)=>{
    const pool = await connectToDatabase();
    try {
      const url = new URL(req.url);
      const id: string = url.searchParams.get("id")?.trim() || "";    
      const rows = await pool.request()
        .input("id", sql.Int, parseInt(id?.trim()))
        .query('SELECT stageName FROM Stages WHERE id = @id');

      if (rows.recordset.length === 0) {
        return NextResponse.json(
          {stageName:"",
             message: 'Stage Name not found' },
          { status: 400 }
        );
      }
      const stageName = rows.recordset[0];
      return NextResponse.json(
        { stageName },
        { status: 200 }
      );

    } catch (error:any) {
      return NextResponse.json(
        { message:error?.message },
        { status: 500 }
      );
    }
  }