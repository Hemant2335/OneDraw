import axios from "axios"

const getShapes = async (RoomId : string) => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/backend/getMessages/${RoomId}` , {
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