'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const router = useRouter();
  
  useEffect(() => {
    // In a static export, we can't use Clerk's sign-up page directly
    // So we redirect to the website page
    router.push('/website');
  }, [router]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Redirecting to website...</h1>
      </div>
    </div>
  );
}
