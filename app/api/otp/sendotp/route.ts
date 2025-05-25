
import { mailOTP } from "@/app/services/mailOTP";
import { NextResponse } from "next/server";

export const POST=async(req:Request)=>{
    const result=await req.json();
    const {email,otp}=result;
    let resp=await mailOTP({email,otp});
    if(resp=="message sent"){
        return NextResponse.json(
            { message: resp },
            { status: 200 }
          );
    }else{
        return NextResponse.json(
            { message: resp },
            { status: 500 }
          );
    }
  
}