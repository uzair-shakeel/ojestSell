import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return <div className='w-full h-auto min-h-screen flex justify-center items-center'>
    <SignIn afterSignInUrl="/dashboard/home" />
  </div>;
}
