"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function AuthButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex items-center gap-3">
        <img
          src={session.user.image}
          alt="Profile"
          className="w-8 h-8 rounded-full"
        />
        <span className="text-black font-semibold">{session.user.name}</span>
        <button
          onClick={() => signOut()}
          className="bg-black text-white px-3 py-1 rounded-lg hover:bg-gray-700 transition-all cursor-pointer"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-black font-semibold">Not signed in</span>
      <button
        onClick={() => signIn("google")}
        className="bg-black text-white px-3 py-1 rounded-lg hover:bg-gray-700 transition-all cursor-pointer"
      >
        Sign in with Google
      </button>
    </div>
  );
}
