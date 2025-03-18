import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="w-full h-auto min-h-screen flex justify-center items-center">
      <SignUp afterSignInUrl="/dashboard/home" />
    </div>
  );
}
