import {NextResponse} from "next/server";

export async function GET() {
    return NextResponse.json({
        backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || "https://backend:5000",
        websocketUrl: process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://websocket:8080",
    });
}
