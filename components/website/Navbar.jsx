'use client'
import React, { useState } from 'react'
import { IoPersonCircleOutline } from 'react-icons/io5'
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="w-full p-4 bg-white shadow-md flex justify-between items-center text-black">
      {/* Logo */}
      <div className="">
        <img onClick={() => router.push('/')} src="/whitelogo.png"  alt="Ojest Logo" className="h-10 cursor-pointer" />
      </div>

   <div className="flex items-center space-x-5 sm:mx-4">
       {/* Add Listing Button */}
       <button className="hidden md:block bg-white border border-gray-300 px-4 py-2 rounded-full  hover:bg-gray-100">
        Become a seller
      </button>

      {/* Mobile Menu Button */}
      <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700">
        <IoPersonCircleOutline size={30} />
      </button>
   </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute z-50 right-4 top-16 bg-white border border-gray-200 shadow-lg rounded-lg p-2 w-48 flex flex-col space-y-2">
          <button className="w-full text-left hover:bg-gray-100 p-1 duration-300" onClick={() => router.push('/dashboard/home')}>Dashboard</button>
          <button className="w-full text-left hover:bg-gray-100 p-1 duration-300">Profile</button>
          <button className="w-full text-left hover:bg-gray-100 p-1 duration-300">Logout</button>
        </div>
      )}
    </header>
  );
}

export default Navbar