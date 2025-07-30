"use client"

import {usePathname} from "next/navigation";
import Whiteboard from '@/Components/Whiteboard';
import {userAtom} from "@/store/atoms/User";
import {useAtomValue} from "jotai";

const WhiteboardPage = () => {
    const pathname = usePathname()
    const user = useAtomValue(userAtom);

    return (
        <div className="hideScrollbar">
            <Whiteboard roomId={pathname.split("/")[2]} /> {/* Pass roomId */}
        </div>
    );
};

export default WhiteboardPage;
