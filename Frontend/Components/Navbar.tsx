"use client"

import React, {useState} from "react";
import Link from "next/link";
import {usePathname} from "next/navigation";

const Navbar = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [adminRoom , setAdminRoom] = useState<string | null>('');
    const pathname = usePathname();

    const createRoom = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/backend/createRoom` ,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "authorization" : localStorage.getItem('token')  || ""
                },
                credentials: "include",

            });
            const data = await res.json();
            return data;
        } catch (error) {
            console.log(error);
            setIsLoading(false);
        }
    }

    const handleWhiteboard = async() => {
        setIsLoading(true);
        if(adminRoom){
            window.location.href = `/Whiteboard/${adminRoom}`;
            return;
        }
        try{
            const newRoom = await createRoom();
            setAdminRoom(newRoom.room.id);
            window.location.href = `/Whiteboard/${newRoom.room.id}`;
        }catch (error) {
            console.log(error);
            setIsLoading(false);
        }

    }


  return (
    <div className={`w-full mt-[4vh] h-[5vh]  items-center justify-center ${pathname !== "/" ? "hidden" : "flex"} `}>
      <div className="bg-[#121212] w-fit h-fit  p-3 title rounded-md fixed z-10">
        <nav className={`flex  justify-between w-[90vw] h-[5vh]`}>
          <div className={`flex gap-[3vw]`}>
            <h1 className={`text-2xl font-bold`}>OneDraw</h1>
            <ul className="flex items-center font-medium gap-[3vh] text-md">
              <li className="hover:text-[#097969] cursor-pointer transition-transform nav-home ">
                Pricing
              </li>
              <li className="hover:text-[#097969] cursor-pointer transition-transform nav-About">
                Contact
              </li>
            </ul>
          </div>
          <div className={`flex gap-2`}>
            {(typeof window != 'undefined' && localStorage.getItem("token")) ? (
              <button onClick={()=>{handleWhiteboard()}} className="bg-primary w-fit py-3 flex items-center  px-[2vw] text-white rounded-md">
                  {isLoading ? `Loading...` : `Whiteboard`}
              </button>
            ) : (
              <Link
                href="/Signin"
                className="bg-base-100 w-fit py-3 flex items-center  px-[2vw] text-white rounded-md"
              >
                Login
              </Link>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
