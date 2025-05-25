// lib/withAuth.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation"; // ✅ use `next/navigation` in App Router
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import React from "react";
import { usePathname } from 'next/navigation';

export function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  const ComponentWithAuth = (props: P) => {
    const router = useRouter();
    const token = useSelector((state: RootState) => state.AuthReducer.token);
    const pathname = usePathname();
    useEffect(() => {
      if (!token) {
        router.replace("/");
      }
    }, [token]);

    if (token) {
        router.replace("/dashboard");
        console.log("Redirecting to dashboard...");
    }
    if( pathname == "/" && token) {
      router.replace("/dashboard");
      console.log("Redirecting to dashboard from root path...");

    }

    if (!token) {
        console.log("Redirecting to login page...");
      return null; // Prevent rendering until redirect happens
    }

    return <WrappedComponent {...props} />;
  };

  return ComponentWithAuth;
}
