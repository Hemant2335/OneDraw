import { atom } from "recoil";

export const User = atom({
    key: "User",
    default: {
        id : "",
        email: "",
        username: "",
        name: "",
    },
})