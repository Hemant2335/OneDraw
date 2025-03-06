"use client"

import React, {useState} from "react";
import Link from "next/link";

const Navbar = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [adminRoom , setAdminRoom] = useState<string | null>('');

    const createRoom = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/createRoom` ,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
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

    const fetchRoom = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getRoom/${localStorage.getItem('token')}` ,{
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
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
        const data = await fetchRoom();
        if(data.error){
            const newRoom = await createRoom();
            if(newRoom){
                setAdminRoom(newRoom.Id);
                window.location.href = `/Whiteboard/${data.Id}`;
            }
        }else{
            setAdminRoom(data.Id);
            window.location.href = `/Whiteboard/${data.Id}`;
        }

    }


  return (
    <div className="w-full mt-[4vh] h-[5vh] flex items-center justify-center ">
      <div className="bg-[#121212] w-fit h-fit  p-3 title rounded-md fixed z-10">
        <nav className={`flex  justify-between w-[90vw] h-[5vh]`}>
          <div className={`flex gap-[3vw]`}>
            <h1 className={`text-2xl font-bold`}>OneDraw</h1>
            <ul className="flex items-center font-medium gap-[3vh] text-md">
              <li className="hover:text-[#097969] cursor-pointer transition-transform nav-home ">
                Pricing
              </li>
              <li className="hover:text-[#097969] cursor-pointer transition-transform nav-About">
                Contact Us
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
