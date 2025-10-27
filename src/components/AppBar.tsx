"use client";
import { MusicIcon } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";

import { useRouter } from "next/navigation";

function AppBar() {
  const route = useRouter();
  const session = useSession();
  return (
    <header className="w-full py-4 px-4 sm:px-6 lg:px-8 bg-gray-800/80 backdrop-blur supports-[backdrop-filter]:bg-gray-800/60 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <MusicIcon className="h-6 w-6 text-purple-400" />
          <span className="text-lg sm:text-2xl font-bold text-purple-400">
            Muzer
          </span>
        </Link>
        <span className="hidden sm:block sm:text-2xl font-bold text-purple-400">
          {session.data?.user?.name}
        </span>
        <div className=" flex gap-3">
          {session.data?.user && (
            <Button
              onClick={() => {
                if (session.data?.user) {
                  route.push("/dashboard");
                }
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white pr-2"
            >
              Create Space
            </Button>
          )}

          {session.data?.user && (
            <Button
              onClick={() => {
                signOut();
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white "
            >
              Log Out
            </Button>
          )}
          {!session.data?.user && (
            <Button
              onClick={() => {
                signIn();
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Log In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

export default AppBar;
