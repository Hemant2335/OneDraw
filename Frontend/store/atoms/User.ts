import {atomWithStorage} from "jotai/utils";

interface User {
    id: string;
    username: string;
    name: string;
    Rooms: string[];
}

export const userAtom = atomWithStorage<User>(
    "user",
    {
        id: "",
        username: "",
        name: "",
        Rooms: [],
    }
);
