import axios from "axios"

const getShapes = async (RoomId : string) => {
    const env = await fetch("/api/config");
    const configenv = await env.json();
    const response = await axios.get(`${configenv.backendUrl}/getMessages/${RoomId}` , {
        headers: {
            "Content-Type": "application/json",
            "authorization": window.localStorage.getItem("token")
        }
    });
    const messages = response.data.messages;

    const shapes = messages.map((message : {message:string}) => {
        return JSON.parse(message.message);
    });

    return shapes;
}

export default getShapes;