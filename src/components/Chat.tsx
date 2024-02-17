import { MouseEvent, useContext, useEffect, useRef, useState } from "react";
import Contacts from "./Contacts";
import MessagesArea from "./MessagesArea";
import { UserInfoContext } from "./ProtectedRoutes";
import AddUser from "./AddUser";
import { useFormik } from "formik";
import io from "socket.io-client";
import { SERVER_URL } from "@/environment";
const socket = io(`${SERVER_URL}/chat`);

type Message = {
    content: string;
    sentAt: string;
    from: string;
    sentTo: string;
};
function Chat() {
    const { userName } = useContext(UserInfoContext);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [currentContactName, setCurrentContactName] = useState("");
    const [messagesArray, setMessagesArray] = useState([
        { content: "", isOwner: false },
    ]);
    socket.on("message", (messageData) => {
        console.log(messageData);
        setMessagesArray([
            ...messagesArray,
            {
                content: messageData.content,
                isOwner: messageData.from === userName,
            },
        ]);
    });
    useEffect(() => {
        socket.emit("joinRoom", {
            client1: userName,
            client2: currentContactName,
        });
    }, [currentContactName, userName]);
    const formik = useFormik({
        initialValues: {
            message: "",
        },
        onSubmit(values, { resetForm }) {
            if (values.message.trim().length < 1) {
                return;
            }
            const epochStr = new Date().getTime();
            const date = new Date(epochStr).toString();
            const messageData: Message = {
                content: values.message,
                sentAt: ``,
                from: userName,
                sentTo: currentContactName,
            };
            socket.emit("message", {
                user1: userName,
                user2: currentContactName,
                messageData,
            });
            resetForm({ values: { message: "" } });
        },
    });
    function escEvent(event: KeyboardEvent) {
        if (event.key === "Escape") {
            if (!menuRef.current) return;
            menuRef.current.style.display = "none";
            destroyEscEvent();
        }
    }
    function closeMenu(event?: MouseEvent) {
        if (event != undefined) {
            event.preventDefault();
        }
        if (!menuRef || !menuRef.current) return;
        menuRef.current.style.display = "none";
        destroyEscEvent();
    }
    function createEscEvent() {
        document.addEventListener("keydown", escEvent);
    }
    function destroyEscEvent() {
        document.removeEventListener("keydown", escEvent);
    }
    function showAddUser(event: MouseEvent) {
        event.preventDefault();
        if (!menuRef.current) return;
        menuRef.current.style.display = "flex";
        createEscEvent();
    }
    return (
        <main className="h-screen flex w-full bg-stone-800 text-white text-base">
            <AddUser menuRef={menuRef} closeMenu={closeMenu}></AddUser>
            <section
                className="flex flex-col h-full"
                style={{ width: "400px" }}
            >
                <header className="flex bg-stone-900 h-14 p-2 justify-between items-center">
                    <div>{userName}</div>
                    <section className="flex items-center gap-3">
                        <button onClick={showAddUser}>add new</button>
                        <menu className="w-8 cursor-pointer h-8 flex flex-col justify-around *:hover:bg-stone-500">
                            <span className="w-full h-1 bg-stone-600 block rounded"></span>
                            <span className="w-full h-1 bg-stone-600 block rounded"></span>
                            <span className="w-full h-1 bg-stone-600 block rounded"></span>
                        </menu>
                    </section>
                </header>
                <Contacts openChat={setCurrentContactName}></Contacts>
            </section>
            <section className="flex flex-row justify-between bg-stone-700 w-full h-full">
                {currentContactName ? (
                    <section className="bg-stone-600 w-full flex flex-col justify-between">
                        <header className="h-14 p-2 flex items-center bg-stone-700">
                            <h2>{currentContactName}</h2>
                        </header>
                        <MessagesArea
                            messagesArray={messagesArray}
                        ></MessagesArea>
                        <footer className="h-14 flex items-center bg-stone-700 p-2">
                            <form
                                action=""
                                method="post"
                                className="w-full h-full flex items-center"
                                onSubmit={formik.handleSubmit}
                            >
                                <input
                                    onChange={formik.handleChange}
                                    type="text"
                                    value={formik.values.message}
                                    autoFocus={true}
                                    autoComplete="off"
                                    name="message"
                                    id="message"
                                    placeholder="Type here"
                                    className="w-full placeholder:text-stone-300 rounded-full p-4 bg-stone-500 h-full"
                                />
                                <input
                                    type="submit"
                                    name="submitMessage"
                                    id="submitMessage"
                                    value={"arrow submit"}
                                    className="w-10 h-full cursor-pointer bg-black rounded-full"
                                />
                            </form>
                        </footer>
                    </section>
                ) : (
                    <section className="grid place-items-center w-full h-full">
                        No chat selected
                    </section>
                )}
            </section>
        </main>
    );
}

export default Chat;
