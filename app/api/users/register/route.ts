import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/services/dbConfig";
import sql from "mssql";
import bcrypt from "bcrypt";
import validator from "validator";
import { CreateToken } from "@/lib/TokenGenerator/getToken";

interface UserInput {
  user_email: string;
  password: string;
  phone: string;
  first_name: string;
  last_name: string;
  empno: string;
  districtId: string;
}

export const POST = async (req: Request) => {
  let transaction: sql.Transaction | null = null;

  try {
    const { user_email, password="Manager@lieda.1234#", phone, first_name,last_name, empno,districtId }: UserInput = await req.json();
    //console.log("Received data:", { user_email, password, phone, first_name, empno,disrtictId });
    if (!isValidData(user_email, password, phone, first_name,last_name, empno,districtId)) {
      return NextResponse.json({ message: isError(user_email, password, phone, first_name,last_name, empno,districtId) }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const tempToken = CreateToken(empno.trim());

    const pool = await connectToDatabase();
    transaction = pool.transaction();
    await transaction.begin();

    await transaction.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Managers' AND xtype='U')
      BEGIN
        CREATE TABLE Managers (
          id INT IDENTITY(1,1) PRIMARY KEY,
          user_email VARCHAR(255) NOT NULL UNIQUE,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          password VARCHAR(255) NOT NULL,
          phone VARCHAR(10) NOT NULL,
          empno INT NOT NULL UNIQUE,
          districtId INT NOT NULL,
          verify_tk VARCHAR(255) NOT NULL,
          create_date DATETIME NOT NULL DEFAULT GETDATE(),
          last_update DATETIME NOT NULL DEFAULT GETDATE(),

          -- Constraints
          CONSTRAINT chk_phone CHECK (phone LIKE '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'),
          CONSTRAINT chk_empno CHECK (empno >= 10000000 AND empno <= 99999999),
          CONSTRAINT chk_districtId CHECK (districtId BETWEEN 1 AND 9)
          
        );
      END
    `);

    const result = await transaction.request()
      .input("user_email", sql.VarChar, user_email.trim())
      .input("first_name", sql.VarChar, first_name.trim())
      .input("last_name", sql.VarChar, last_name.trim())
      .input("password", sql.VarChar, hashedPassword)
      .input("phone", sql.VarChar, phone.trim())
      .input("empno", sql.Int, parseInt(empno.trim()))
      .input("districtId", sql.Int, parseInt(districtId?.trim()))
      .input("verify_tk", sql.VarChar, tempToken.trim())
      .input("last_update", sql.DateTime, new Date())
      .query(`
        INSERT INTO Managers (user_email, first_name, last_name, password, phone, empno, districtId, verify_tk, last_update)
        OUTPUT inserted.*
        VALUES (@user_email, @first_name, @last_name, @password, @phone, @empno, @districtId, @verify_tk, @last_update)
      `);

    const user = result.recordset[0];
    if (!user) throw new Error("User insertion failed.");

      await transaction.commit();

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(
      { message: "User added successfully", token: tempToken, user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error:", error.message);

    if (transaction) await transaction.rollback();

    if (error.message.includes("Violation of UNIQUE KEY constraint") || error.message.includes("duplicate key")) {
      return NextResponse.json({ message: "User already exists (email or Employee ID is in use)" }, { status: 409 });
    }

    return NextResponse.json({ message: "Internal server error. Please try again later." }, { status: 500 });
  }
};

const isValidData = (
  user_email: string,
  password: string,
  phone: string,
  first_name: string,
  last_name: string,
  empno: string,
  disrtictId: string
): boolean => {
  const phoneRegex = /^\d{10}$/;
  const empNoRegex = /^\d{8}$/;
  const districtIdRegex = /^\d{1}$/; // Assuming districtId is a 1-digit number

  const isStrongPassword = password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password);

  return (
    validator.isEmail(user_email.trim()) &&
    first_name.trim().length > 0 &&
    last_name.trim().length > 0 &&
    isStrongPassword &&
    phoneRegex.test(phone.trim()) &&
    empNoRegex.test(empno.trim()) &&
    disrtictId.trim().length == 1 && // Assuming districtId is a single character
    (disrtictId ? districtIdRegex.test(disrtictId.trim()) : true) // Optional check for districtId
  );
};
//user_email, password, phone, first_name,last_name, empno
const isError = (
  user_email: string,
  password: string,
  phone: string,
  first_name: string,
  last_name: string,
  empno: string,
  disrtictId: string
): string => {
  const phoneRegex = /^\d{10}$/;
  const empNoRegex = /^\d{8}$/;
  const districtIdRegex = /^\d{1}$/; // Assuming districtId is a 1-digit number
  const isStrongPassword = password.length >= 8 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /\d/.test(password);
  
      if(!isStrongPassword){
        return "Password is not strong enough"
      }
      if(!validator.isEmail(user_email.trim())){
        return "Email is not valid";
      }
      if(first_name.trim().length <= 0){
        return "First name is not valid";
      }
      if(last_name.trim().length <= 0){
        return "Last name is not valid";
      }
      if(!phoneRegex.test(phone.trim())){
        return "Phone number is not valid";
      }
      if(!empNoRegex.test(empno.trim())){
        return "Employee ID is not valid";
      }
      if(!phoneRegex.test(phone.trim())){ 
        return "Phone number is not valid";
      }
      if(disrtictId.trim().length !== 1){
        return "District ID is not valid";
      }
      if(disrtictId && !districtIdRegex.test(disrtictId.trim())){
        return "District ID is not valid";
      }
      return "No error";
};
