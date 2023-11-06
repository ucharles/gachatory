"use client";
import { signOut } from "next-auth/react";

interface ISignOutButtonProps {
  className?: string;
}
export default function SignOutButton({ className }: ISignOutButtonProps) {
  return (
    <button onClick={() => signOut()} className={className}>
      Sign out
    </button>
  );
}
