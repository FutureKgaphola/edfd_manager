
"use client";
import { Button, FooterDivider, Label, Radio, Spinner, TextInput } from "flowbite-react";
import Link from "next/link";
import { customInputBoxTheme, customsubmitTheme } from "../SiteTheme/Theme";
import { HiMail } from "react-icons/hi";
import { TbNumber123 } from "react-icons/tb";
import { useState } from "react";
import { failureMessage, successMessage } from "../notifications/successError";
import validator from 'validator';
import { usePublic_pages } from "../hooks/usePublic_pages";
import Image from "next/image";
import ledalogo from '../assets/images/logoleda.png';

export default function ForgotPassword() {
    const { IsNotSignedin } = usePublic_pages();
    IsNotSignedin();

    const [email, setEmail] = useState("");
    const [TabChice, SetTabChice] = useState("Request OTP");
    const [otp, setOTP] = useState("");
    const [newpassword, setNewPassword] = useState("");
    const [loading, setloading] = useState(false);
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        SetTabChice(event.target.value);
    };

    const HandleRequestOTP = async () => {
        if (!email || !validator.isEmail(email)) {
            return failureMessage("Please provide a valid email address.");
        }

        try {
            setloading(true);
            // Check if the email is already registered
            const res = await fetch("/api/users/checkemail", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (data && data?.exists) {
                // request OTP
                const res1 = await fetch("/api/otp/request", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                });

                const created = await res1.json();
                if (created && created?.otp) {
                    // Send OTP to the email address
                    const res = await fetch("/api/otp/sendotp", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email, otp: created.otp }),
                    });

                    const data = await res.json();
                    if (data) {
                        successMessage("OTP sent successfully.");
                    } else {
                        failureMessage(data.message);
                    }
                } else {
                    failureMessage("Failed to create OTP.");
                }

            }
            if (data && !data?.exists) {
                failureMessage(data.message);
            }

            if (!data) {
                return failureMessage(data.message);
            }

        } catch (error) {
            failureMessage(String(error));
        } finally {
            setloading(false);
        }
    };

    const HandleResetPassword = async () => {
        if (!otp || !newpassword || !validator.isStrongPassword(newpassword)) {
            return failureMessage("Please provide a valid OTP and strong password.");
        }

        try {
            setloading(true);
            const res = await fetch("/api/otp/resetpassword", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp, newpassword }),
            });

            const data = await res.json();
            if (data.success) {
                successMessage("Password reset successfully.");
                setEmail("");
                setNewPassword("");
                setOTP("");
            } else {
                failureMessage(data.message);
            }
        } catch (error) {
            failureMessage(String(error));
        } finally {
            setloading(false);
        }
    };

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

                        <Image
                            width={65}
                            height={65}
                            src={ledalogo}
                            alt="loda logo"
                        />
                        <h2 className="text-lg font-bold">Send Password Reset</h2>
                        <p className="text-gray-600 font-light">Enter your email address below. We`ll look for your account and send you an OTP(One Time Pin).</p>
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="email1">
                                    Email
                                    </Label>
                            </div>
                            <TextInput value={email} onChange={(e: any) => setEmail(e.target.value)} theme={customInputBoxTheme} color={"focuscolor"} icon={HiMail} id="email1" type="email" placeholder="name@mailprovider.com" required />
                        </div>
                        <fieldset className="flex max-w-md flex-wrap gap-4">
                            <legend className="mb-4 font-bold break-words text-wrap text-xs">Received The OTP?</legend>

                            <div className="flex items-center gap-2">
                                <Radio
                                    id="requestOTP"
                                    name="Request OTP"
                                    value="Request OTP"
                                    checked={TabChice === "Request OTP"}
                                    onChange={handleChange}
                                />
                                <Label htmlFor="requestOTP">Request OTP</Label>
                            </div>

                            <div className="flex items-center gap-2">
                                <Radio
                                    id="I-have-an-OTP"
                                    name="I have an OTP"
                                    value="I have an OTP"
                                    checked={TabChice === 'I have an OTP'}
                                    onChange={handleChange}
                                />
                                <Label htmlFor="I-have-an-OTP">I have an OTP</Label>
                            </div>
                        </fieldset>
                        {
                            TabChice === "I have an OTP" ?
                                <div>
                                    <div className="mb-2 block">
                                        <Label htmlFor="otp">OTP</Label>
                                    </div>
                                    <TextInput max={6} minLength={1} maxLength={6} value={otp} onChange={(e: any) => setOTP(e.target.value)} theme={customInputBoxTheme} color={"focuscolor"} icon={TbNumber123} id="otp" type="text" placeholder="Enter OTP" required />
                                </div> : null
                        }
                        {
                            TabChice === "I have an OTP" ?
                                <div>
                                    <div className="mb-2 block">
                                       <div className="flex items-center gap-2">
                                       <Label htmlFor="newpassword">New Password</Label>
                                       <p className="text-sm font-thin">{newpassword}</p>
                                       </div>
                                    </div>
                                    <TextInput value={newpassword} max={15} maxLength={15} onChange={(e: any) => setNewPassword(e.target.value)} theme={customInputBoxTheme} color={"focuscolor"} icon={TbNumber123} id="newpassword" type="password" placeholder="Enter New Password" required />
                                </div> : null
                        }
                        {
                            TabChice === "Request OTP" ? <Button disabled={loading} onClick={() => HandleRequestOTP()} theme={customsubmitTheme} type="button" color="appsuccess">
                                {loading ? ( <Spinner size="sm" aria-label="Info spinner example" className="me-3" light />): null}
                                Request OTP</Button> : null
                        }

                        {
                            TabChice === "I have an OTP" ? <Button disabled={loading} onClick={()=>HandleResetPassword()} theme={customsubmitTheme} type="button" color="appsuccess">
                                {loading ? ( <Spinner size="sm" aria-label="Info spinner example" className="me-3" light />): null}
                                Reset My Password</Button> : null
                        }

                        <FooterDivider></FooterDivider>
                        <div className="flex justify-end gap-2">
                            <p>Done with reset?</p> <Link className="text-appGreen" href={"/"}> Login</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
