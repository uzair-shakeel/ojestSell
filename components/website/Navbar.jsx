'use client'
import React, { useState } from 'react'
import { IoPersonCircleOutline } from 'react-icons/io5'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="w-full p-4 bg-white shadow-md flex justify-between items-center">
      {/* Logo */}
      <div className="">
        <img src="/whitelogo.png"  alt="Ojest Logo" className="h-10" />
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
        <div className="absolute right-4 top-16 bg-white border border-gray-200 shadow-lg rounded-lg p-2 w-48 flex flex-col space-y-2">
          <button className="w-full text-left hover:bg-gray-100 p-1 duration-300">Dashboard</button>
          <button className="w-full text-left hover:bg-gray-100 p-1 duration-300">Profile</button>
          <button className="w-full text-left hover:bg-gray-100 p-1 duration-300">Logout</button>
        </div>
      )}
    </header>
  );
}

export default Navbar