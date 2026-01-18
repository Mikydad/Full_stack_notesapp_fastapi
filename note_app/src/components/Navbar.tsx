import React from "react";
import Signup from "../auth/Signup";
import { Link } from "react-router-dom";


function Navbar() {
  return (
    <nav className="w-full bg-white shadow-md px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <div className="text-2xl font-bold text-indigo-600 cursor-pointer">
          Logo
        </div>

        {/* Menu */}
        <ul className="flex items-center gap-6 text-gray-700 font-medium">
          <li className="cursor-pointer hover:text-indigo-600 transition-colors">
            Create Category
          </li>
          <li className="cursor-pointer hover:text-indigo-600 transition-colors">
            About Us
          </li>
          <li className="cursor-pointer px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition">
                <Link to="/signup">Sign Up</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
