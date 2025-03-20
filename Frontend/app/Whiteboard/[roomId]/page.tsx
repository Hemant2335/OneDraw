"use client"

import {usePathname} from "next/navigation";
import Whiteboard from '@/Components/Whiteboard';
import {useEffect} from 'react';

const WhiteboardPage = () => {
    const pathname = usePathname()

    useEffect(() => {
        console.log(pathname.split("/")[2]); // Logs the current pathname
    }, [pathname]); // Dependency on pathname

    return (
        <div>
            <Whiteboard roomId={pathname.split("/")[2]} /> {/* Pass roomId */}
        </div>
    );
};

export default WhiteboardPage;
