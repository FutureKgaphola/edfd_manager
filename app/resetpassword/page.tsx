
"use client";
import { Button, Label, Spinner, TextInput } from "flowbite-react";
import Link from "next/link";
import { customInputBoxTheme, customsubmitTheme } from "../SiteTheme/Theme";
import { HiMail } from "react-icons/hi";
import { useState } from "react";

export default function Resetpassword() {

    const [pass, setPass] = useState("");
    const [loading, setloading] = useState(false);
   
    return (
        <div className="items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]" style={{
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundImage:
                "url('tree.jpg')",
        }}>

            <div>
                <div>
                    <form className=" bg-white flex max-w-md flex-col gap-4 w-screen flex-grow border p-7 rounded-md shadow-md">
                        <h2 className="text-lg font-bold">Update your password</h2>
                        <p className="text-gray-600 font-light">Enter your new password below. We`ll help reset it for you.</p>
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="pass">Your Password</Label>
                            </div>
                            <TextInput value={pass} onChange={(e: any) => setPass(e.target.value)} theme={customInputBoxTheme} color={"focuscolor"} icon={HiMail} id="pass" type="password" placeholder="******" required />
                        </div>
                        {pass && <p className="font-poppinsLight">{pass}</p>}
                        <Button disabled={loading} theme={customsubmitTheme} type="button" color="appsuccess">
                            {loading ? ( <Spinner size="sm" aria-label="Info spinner example" className="me-3" light />): null}
                            Save Password</Button>
                        <hr></hr>
                        <div className="flex justify-end gap-2">
                            <p>Done?, let's</p> <Link className="text-appGreen" href={"/"}> Login</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>

    );
}
