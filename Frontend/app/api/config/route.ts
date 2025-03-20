import {NextResponse} from "next/server";

export async function GET() {
    return NextResponse.json({
        backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000",
        websocketUrl: process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:8080",
    });
}
