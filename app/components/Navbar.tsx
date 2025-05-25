
"use client";

import { Avatar, Dropdown, DropdownHeader, DropdownItem, Navbar, NavbarBrand, Spinner } from "flowbite-react";
import ledalogo from '../assets/images/logoleda.png';
import Image from "next/image";
import Link from "next/link";
import { useSignout } from "../hooks/useSignout";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { useDomReady } from "../hooks/useDomReady";

export function Nav_bar() {
  const { handleSigOut, errorLogout } = useSignout();
  const { domReady } = useDomReady();
  const Authprop = useSelector((state: RootState) => state.AuthReducer);

  return (
    <header className="w-full bg-gray-700">

      <Navbar suppressHydrationWarning fluid rounded className="bg-gray-700">
        <NavbarBrand as={Link} href="/">
          <Image priority src={ledalogo} width={110} height={110} className="mr-3 bg-white p-2" alt="Leda Logo" />
          <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">{""}</span>
        </NavbarBrand>
        <div className="flex md:order-2">
          {
            domReady ? (
              <Dropdown className="z-20"
                arrowIcon={false}
                inline
                label={
                  <Avatar alt="User settings"
                    img={'/user.png'} />
                }
              >
                <DropdownHeader>
                  <Link href={'/profile'}><span className="block text-sm">{Authprop?.user?.first_name ?? ""}</span></Link>
                  <Link href={'/profile'}><span className="block truncate text-sm font-medium">{Authprop?.user?.user_email ?? ""}</span></Link>
                </DropdownHeader>

                <DropdownItem onClick={() => handleSigOut()} >Sign out</DropdownItem>
              </Dropdown>
            ) : <div className="flex items-center justify-center">
              <Spinner color="success" aria-label="Success spinner example" />
            </div>
          }

        </div>
        <p>{errorLogout && errorLogout}</p>
      </Navbar>
    </header>

  );

}
