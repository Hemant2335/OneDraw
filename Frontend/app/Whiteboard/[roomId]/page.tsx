"use client"

import {usePathname} from "next/navigation";
import Whiteboard from '@/Components/Whiteboard';

const WhiteboardPage = () => {
    const pathname = usePathname()
    return (
        <div className="hideScrollbar">
            <Whiteboard roomId={pathname.split("/")[2]} /> {/* Pass roomId */}
        </div>
    );
};

export default WhiteboardPage;
