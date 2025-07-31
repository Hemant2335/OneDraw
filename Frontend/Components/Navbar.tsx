"use client"

import React, {useState} from "react";
import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";
import {userAtom} from "@/store/atoms/User";
import {useAtom} from "jotai";

const Navbar = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useAtom(userAtom);
    const pathname = usePathname();
    const router = useRouter();

    const createRoom = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/createRoom`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "authorization": localStorage.getItem('token') || ""
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
        if(user.Rooms.length > 0){
            window.location.href = `/Whiteboard/${user.Rooms[0]}`;
            return;
        }
        try{
            const newRoom = await createRoom();
            if(newRoom){
                setUser((prev) => ({
                    ...prev,
                    Rooms: [...prev.Rooms, newRoom.room.id]
                }))
            }
            router.push(`/Whiteboard/${newRoom.room.id}`);
        }catch (error) {
            console.log(error);
            setIsLoading(false);
        }
    }

    return (
        <div className={`w-full bg-black backdrop-blur-sm mt-[4vh] h-[8vh] text-white shadow-lg  border-gray-800 ${pathname !== "/" ? "hidden" : "flex"} items-center justify-center`}>
            <div className="w-fit h-fit p-4 rounded-lg fixed z-10 bg-black/80 backdrop-blur-md   border-gray-800/50 shadow-2xl">
                <nav className="flex justify-between items-center w-[90vw] h-[6vh] px-4">
                    {/* Left Section - Logo and Navigation */}
                    <div className="flex items-center gap-[4vw]">
                        <div className="flex items-center gap-3">
                            {/* Logo Icon */}
                            <div className="w-8 h-8 bg-gradient-to-br from-[#097969] to-[#0a8a73] rounded-lg flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="white"/>
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                OneDraw
                            </h1>
                        </div>

                        <ul className="flex items-center font-medium gap-[3vh] text-md">
                            <li className="hover:text-[#097969] cursor-pointer transition-all duration-300 hover:scale-105 relative group">
                                Pricing
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#097969] transition-all duration-300 group-hover:w-full"></span>
                            </li>
                            <li className="hover:text-[#097969] cursor-pointer transition-all duration-300 hover:scale-105 relative group">
                                Contact
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#097969] transition-all duration-300 group-hover:w-full"></span>
                            </li>
                        </ul>
                    </div>

                    {/* Right Section - Auth Button */}
                    <div className="flex gap-3 items-center">
                        {(typeof window != 'undefined' && localStorage.getItem("token")) ? (
                            <button
                                onClick={handleWhiteboard}
                                disabled={isLoading}
                                className="bg-gradient-to-r from-[#097969] to-[#0a8a73] hover:from-[#0a8a73] hover:to-[#0b9b80]
                                         disabled:opacity-70 disabled:cursor-not-allowed
                                         w-fit py-3 px-6 text-white rounded-lg font-medium
                                         transition-all duration-300 hover:shadow-lg hover:shadow-[#097969]/25
                                         transform hover:scale-105 active:scale-95
                                         flex items-center gap-2 min-w-[120px] justify-center"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Loading...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="white"/>
                                        </svg>
                                        <span>Whiteboard</span>
                                    </>
                                )}
                            </button>
                        ) : (
                            <Link
                                href="/Signin"
                                className="bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-gray-500
                                         w-fit py-3 px-6 text-white rounded-lg font-medium
                                         transition-all duration-300 hover:shadow-lg
                                         transform hover:scale-105 active:scale-95
                                         flex items-center gap-2"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="white"/>
                                </svg>
                                <span>Login</span>
                            </Link>
                        )}
                    </div>
                </nav>
            </div>
        </div>
    );
};

export default Navbar;
