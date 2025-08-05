import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import { Bot } from "lucide-react"; // optional robot icon

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] px-4 text-center">
      {/* Sad Robot Emoji or Icon */}
      <div className="text-[80px] mb-4 animate-bounce">😓</div>
      {/* <Bot className="w-20 h-20 text-gray-400 mb-4 animate-pulse" /> */}

      <h1 className="text-6xl font-bold gradient-title mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>

      {/* Apology Text */}
      <p className="text-gray-600 mb-2">
        Sorry for the inconvenience, but...
      </p>
      <p className="text-gray-600 mb-8">
       The page you are looking for does not exist.!!
      </p>

      <Link href="/">
        <Button>Return Home</Button>
      </Link>
    </div>
  );
};

export default NotFound;
