"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

const Signup = () => {
    const [Name, setName] = useState<string | null>(null);
    const [Username, setUsername] = useState<string | null>(null);
    const [Password, setPassword] = useState<string | null>(null);
    const [Terms, setTerms] = useState<boolean>(false);
    const [Warning, setWarning] = useState<string | null>(null);
    const router = useRouter();

    async function createuser(Props:{Name:string,Username:string,Password:string}) {
        console.log("Running");
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/signUp` ,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: Props.Name,
                    password: Props.Password,
                    username: Props.Username,
                }),
                credentials: "include",
            });
            const data = await res.json();
            return data;
        } catch (error) {
            console.log(error);
            return "An error occurred";
        }
    }

    const handlebtnclick = async () => {
        // Could have used a Better approach for Error handling

        if (!Terms) {
            setWarning("Please Accept the Terms and Conditions");
            return;
        }
        if (!Name || !Username || !Password) {
            setWarning("Please Fill all the fields");
            return;
        }
        if (Password && Password?.length <= 6) {
            setWarning("Password should be greater than 6 characters");
            return;
        }
        const data = await createuser({ Name, Username, Password });
        console.log(data);
        if (!data) {
            return setWarning("Something Went Wrong");
        }
        if (data.Status === false) {
            setWarning(data.error);
            return;
        }
        router.push("/Signin");
    };

    return (
        <div className="flex h-screen">
            <div className="md:flex hidden cursor-pointer  text-[3vh] w-[40vw] h-screen font-bold ">
                <Image
                    src={require("@/assets/banner.jpg")}
                    className=" object-cover w-full h-full"
                    alt="logo"
                />
            </div>
            <div className="md:w-[60vw] w-full relative justify-center flex-col flex h-full ">
                <div>
          <span className=" gap-2 text-sm font-medium absolute top-5 right-0 p-4 text-left flex float-end">
            Already a member ? <a className="text-blue-400 cursor-pointer" onClick={()=>{router.push("/Signin")}}>Sign in</a>
          </span>
                </div>

                <div className="md:px-[12vw]  m-[5vh] h-fit">
                    <h1 className=" font-black text-[3.5vh]">Sign up to OneDraw</h1>
                    {Warning && (
                        <h2 className="text-red-400 font-medium text-[2vh] pt-[2vh] pb-[3vh]">
                            • {Warning}
                        </h2>
                    )}
                    <div className="flex flex-col gap-[4vh]">
                        <div className="flex flex-col gap-[4vh] mt-[5vh] md:flex-row justify-between">
                            <div>
                                <h1 className="font-black text-[2.1vh] mb-[0.7vh]">Name</h1>
                                <input
                                    type="text"
                                    placeholder="eg. John Doe"
                                    className="bg-[#F3F3F3] w-full font-medium text-sm  focus:outline-none p-[1.6vh] rounded-md"
                                    onChange={(e) => {
                                        setName(e.target.value);
                                    }}
                                />
                            </div>
                            <div>
                                <h1 className="font-black text-[2.1vh] mb-[0.7vh]">Username</h1>
                                <input
                                    type="text"
                                    placeholder="eg. johndoe"
                                    className="bg-[#F3F3F3] w-full font-medium text-sm focus:outline-none p-[1.6vh] rounded-md"
                                    onChange={(e) => {
                                        setUsername(e.target.value);
                                    }}
                                />
                            </div>
                        </div>
                        <div>
                            <h1 className="font-black text-[2.1vh] mb-[0.7vh]">Password</h1>
                            <input
                                type="text"
                                placeholder="6+ characters"
                                className="bg-[#F3F3F3] w-full text-sm font-medium focus:outline-none p-[1.6vh] rounded-md"
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                }}
                            />
                        </div>
                        <div className="flex gap-[1vw]">
                            <input
                                type="checkbox"
                                height={30}
                                name="Terms"
                                id="terms"
                                checked={Terms}
                                onChange={(e) => setTerms(e.target.checked)}
                            />
                            <label
                                htmlFor="terms"
                                className="text-gray-700 text-[2vh] font-medium "
                            >
                                Creating an account means you&apos;re okay with our{" "}
                                <a className="text-blue-400">
                                    Terms of Service, Privacy Policy,
                                </a>{" "}
                                and our default{" "}
                                <a className="text-blue-400">Notification Settings.</a>
                            </label>
                        </div>
                        <button
                            onClick={handlebtnclick}
                            className="bg-[#EA4B8B] w-fit py-2 px-[2vw] text-white rounded-lg"
                        >
                            Create Account
                        </button>
                        <p className="text-[1.5vh] md:max-w-[20vw] text-gray-700 font-medium">
                            This site is protected by reCAPTCHA and the Google{" "}
                            <a className="text-blue-400 text-[1.7vh]">Privacy Policy</a> and{" "}
                            <a className="text-blue-400 text-[1.7vh]">Terms of Service</a>{" "}
                            apply
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;