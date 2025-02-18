import axios from "axios"

const getShapes = async () => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getMessages/1` , {
        headers: {
            "Content-Type": "application/json",
            "authorization": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MzhjOGQwLTI3MzMtNDc4Ni05ZGMyLTAyY2Q2NjM3ZDAxZCIsImlhdCI6MTczOTc5ODQzMH0.CVCSpcQIuQ40Ya3mgCLnQyEyAaxQtH_63jNJl_8MORg"
        }
    });
    const messages = response.data.messages;

    const shapes = messages.map((message : {message:string}) => {
        return JSON.parse(message.message);
    });

    return shapes;
}

export default getShapes;