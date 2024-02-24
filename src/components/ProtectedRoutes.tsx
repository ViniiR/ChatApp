import { SERVER_URL } from "@/environment";
import axios from "axios";
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Loading from "./Loading";
import { createContext } from "react";
import { io } from "socket.io-client";

const UserInfoObject = {
    userName: "",
    contactsList: [{ messages: [""], name: "" }],
};

function ProtectedRoutes() {
    const [isValidToken, setIsValidToken] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        async function callback() {
            try {
                const res = await axios.get(
                    `${SERVER_URL}/users/authorization`,
                    {
                        withCredentials: true,
                    }
                );
                const UserName = res.data.currentUserName as string;
                UserInfoObject.userName = UserName;
                const infoRes = await axios.get(`${SERVER_URL}/users/info`, {
                    withCredentials: true,
                });
                infoRes.data.userInfo.contacts.forEach(
                    (element: string, i: number) => {
                        UserInfoObject.contactsList[i] = {
                            name: element,
                            messages: [""],
                        };
                    }
                );
                setIsValidToken(true);
                setIsLoading(false);
            } catch (err) {
                setIsValidToken(false);
                setIsLoading(false);
            }
        }
        callback();
    }, []);
    if (isLoading) {
        return <Loading />;
    }
    return isValidToken ? <Outlet></Outlet> : <Navigate to="/login"></Navigate>;
}

export default ProtectedRoutes;

export const UserInfoContext = createContext(UserInfoObject);

export const SocketContext = createContext(
    io(`${SERVER_URL}/chat`, { autoConnect: false })
);
