// app/sign-up/page.js
'use client';
import { SignUp, useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function SignUpPage() {


  return (
    <div className="w-full h-auto min-h-screen flex justify-center items-center">
      <SignUp afterSignUpUrl="/dashboard/profile" />
    </div>
  );
}