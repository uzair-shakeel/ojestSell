"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to /website when the component mounts
    router.push("/");
  }, [router]);

  // Optional: Render something while redirecting
  return <div>Redirecting to website...</div>;
};

export default Page;
