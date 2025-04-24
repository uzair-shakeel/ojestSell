'use client'
import DashboardStats from '../../../components/dashboard/DashboardStats'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import axios from 'axios'
import { useAuth } from '@clerk/nextjs'; // or '@clerk/clerk-react'

const page = () => {
  const { user } = useUser();
  const router = useRouter();
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  const fetchToken = async () => {
    const token = await getToken();
    console.log('Clerk JWT Token:', token);
    return token;
  };

  useEffect(() => {
    if (user) {
      axios
        .post(
          'http://localhost:5000/api/users/sync-user',
          {user}, // No body needed since backend uses req.auth.userId
          {
            headers: {
              'Content-Type': 'application/json',
            },
            withCredentials: true, // Include cookies for Clerk JWT
          }
        )
        .then((response) => {
          console.log(response)
          const data = response.data;
          if (data.error) {
            console.error('Sync error:', data.error);
            setError(data.error);
          } else {
            console.log('Sync success:', data.message);
            router.push('/dashboard/profile');
          }
        })
    }
  }, [user]);
  return (
    <div>
    <h1 className="text-2xl font-bold mb-4">Dashboard Overviewww</h1>
    {error && <p className="text-red-500 mb-4">{error}</p>}
    <button onClick={fetchToken}>Log Token</button>
    
    <DashboardStats />
  </div>
  )
}

export default page