import { NextResponse } from "next/server";

const POST=(req:Request)=>{
    try {
        
        return new NextResponse(JSON.stringify({ message: 'A password reset link has been sent' }), { status: 200 });

    } catch (error:any) {
        return new NextResponse(JSON.stringify({ message: error.message }), { status: 500 });
    }
}