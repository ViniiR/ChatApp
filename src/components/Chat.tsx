import {
    MouseEvent,
    RefObject,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import Contacts from "./Contacts";
import MessagesArea from "./MessagesArea";
import { SocketContext, UserInfoContext } from "./ProtectedRoutes";
import AddUser from "./AddUser";
import { useFormik } from "formik";
import axios from "axios";
import { SERVER_URL } from "@/environment";
import sendIcon from "@assets/sendMessage.png";
import addFriendIcon from "@/assets/addFriend.png";
import removeFriendIcon from "@assets/removeFriend.png";
import DescriptionCaption from "./DescriptionCaption";
import UserMenu from "./UserMenu";
import CloseButton from "./CloseButton";
import Button from "./Button";
import { useNavigate } from "react-router-dom";

function Chat() {
    const { userName } = useContext(UserInfoContext);
    const navigateTo = useNavigate();
    const userMenuRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [currentContactName, setCurrentContactName] = useState("");
    const socket = useContext(SocketContext);
    const [userMessages, setUserMessages] = useState<UserMessages[]>([]);
    const textInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        socket.connect();
        return () => {
            socket.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        socket.emit("joinRoom", {
            client1: userName,
            client2: currentContactName,
        });
        //empties array of messages so messages between users don't overlap
        setUserMessages([]);
        textInputRef.current?.focus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentContactName]);

    useEffect(() => {
        const messageHandler = (data: {
            owner: string;
            content: string;
            timestamp: string;
        }) => {
            setUserMessages((previousMessages) => [
                ...previousMessages,
                {
                    content: data.content,
                    isOwner: data.owner === userName,
                    currentTime: data.timestamp,
                },
            ]);
        };
        socket.on("message", messageHandler);
        return () => {
            socket.off("message", messageHandler);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, userName]);

    async function removeContact() {
        try {
            const res = await axios.patch(`${SERVER_URL}/users/remove-friend`, {
                name: currentContactName,
                userName: userName,
            });
            console.log(res);
            window.location.reload();
        } catch (err) {
            console.log(err);
            console.error(err);
        }
    }

    function emitMessage(message: Message) {
        socket.emit("message", message);
    }

    const formik = useFormik({
        initialValues: {
            message: "",
        },
        onSubmit(values, { resetForm }) {
            if (values.message.trim().length < 1) {
                return;
            }

            const messageData: Message = {
                content: values.message,
                owner: userName,
                sentTo: currentContactName,
            };

            emitMessage(messageData);

            resetForm({ values: { message: "" } });
        },
    });
    function escEvent(event: KeyboardEvent) {
        if (event.key === "Escape") {
            if (!menuRef.current) return;
            menuRef.current.style.display = "none";
            destroyEscEvent();
        } else if (event.key === "Enter") {
            event.preventDefault();
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
    let escEventListener: ((event: KeyboardEvent) => void) | null = null;
    function genericEscEvent(element: HTMLElement) {
        element.style.display = "none";
    }
    function createGenericEscEvent(ref: RefObject<HTMLElement>) {
        escEventListener = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                genericEscEvent(ref.current!);
                purgeGenericEscEvent();
            }
        };
        document.addEventListener("keydown", escEventListener);
    }
    function purgeGenericEscEvent() {
        if (escEventListener) {
            document.removeEventListener("keydown", escEventListener);
            escEventListener = null; // Reset the variable after removing the listener
        }
    }
    function closeGenericMenu(event: MouseEvent, ref: RefObject<HTMLElement>) {
        event.preventDefault();
        event.stopPropagation();
        if (ref && ref.current) {
            ref.current.style.display = "none";
            purgeGenericEscEvent();
        }
    }
    function showGenericMenu(event: MouseEvent, ref: RefObject<HTMLElement>) {
        event.preventDefault();
        event.stopPropagation();
        if (ref && ref.current) {
            ref.current.style.display = "grid";
            createGenericEscEvent(ref);
        }
    }
    async function deleteAccount() {
        try {
            await axios.delete(`${SERVER_URL}/users/delete-user`, {
                params: {
                    userName: userName,
                },
                withCredentials: true,
            });
            navigateTo("/login");
        } catch (err) {
            console.error(err);
        }
    }
    async function logOut() {
        try {
            await axios.delete(`${SERVER_URL}/users/end-session`, {
                withCredentials: true,
            });
            navigateTo("/login");
        } catch (err) {
            console.error(err);
        }
    }
    return (
        <main className="h-screen flex w-full bg-stone-800 text-white text-base">
            <AddUser menuRef={menuRef} closeMenu={closeMenu}></AddUser>
            <UserMenu reference={userMenuRef} className="flex flex-col gap-1">
                <section className="flex justify-between w-full items-center">
                    <strong>Settings</strong>
                    <CloseButton
                        closeMenuFunction={(event) => {
                            closeGenericMenu(event, userMenuRef);
                        }}
                    ></CloseButton>
                </section>
                <section className="flex flex-col gap-1">
                    <Button onClickDo={logOut}>LogOut</Button>
                    <Button onClickDo={deleteAccount}>Delete Account</Button>
                </section>
            </UserMenu>
            <section
                className="flex flex-col h-full"
                style={{ width: "400px" }}
            >
                <header className="flex bg-stone-900 h-14 p-2 justify-between items-center">
                    <div>{userName}</div>
                    <section className="flex items-center gap-3">
                        <button
                            onClick={showAddUser}
                            className="flex w-8 h-8 justify-center hover:bg-stone-700 rounded-full show-caption-hover relative"
                        >
                            <img
                                src={addFriendIcon}
                                className="w-full h-full"
                                alt=""
                            />
                            <DescriptionCaption
                                topDistance={40}
                                text="Add new friend"
                            ></DescriptionCaption>
                        </button>
                        <menu
                            className="w-8 cursor-pointer h-8 flex flex-col justify-around *:hover:bg-stone-500"
                            onClick={(event) => {
                                showGenericMenu(event, userMenuRef);
                            }}
                        >
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
                        <header className="h-14 p-2 flex items-center justify-between bg-stone-700">
                            <section className="w-10 flex flex-col justify-between p-2">
                                <h2 className="font-semibold text-lg h h-2/3">
                                    {currentContactName}
                                </h2>
                                <p className="h-1/3 text-sm text-neutral-400">
                                    friend
                                </p>
                            </section>
                            <button
                                onClick={removeContact}
                                className="flex w-8 h-8 justify-center hover:bg-stone-600 rounded-full p-1 relative show-caption-hover"
                            >
                                <img
                                    src={removeFriendIcon}
                                    className="w-7"
                                    alt=""
                                />
                                <DescriptionCaption
                                    topDistance={40}
                                    text="Remove friend"
                                ></DescriptionCaption>
                            </button>
                        </header>
                        <MessagesArea
                            totalMessages={userMessages}
                        ></MessagesArea>
                        <footer className="h-14 flex items-center bg-stone-700 p-2">
                            <form
                                action=""
                                method="post"
                                className="w-full h-full flex items-center gap-1"
                                onSubmit={formik.handleSubmit}
                            >
                                <input
                                    onChange={formik.handleChange}
                                    type="text"
                                    value={formik.values.message}
                                    autoFocus={true}
                                    ref={textInputRef}
                                    autoComplete="off"
                                    name="message"
                                    id="message"
                                    placeholder="Type here"
                                    className="w-full placeholder:text-stone-300 rounded-full p-4 bg-stone-500 h-full"
                                />
                                <section className="w-10 cursor-pointer flex items-center justify-center rounded-full hover:bg-stone-500 h-full relative show-caption-hover">
                                    <input
                                        type="submit"
                                        name="submitMessage"
                                        id="submitMessage"
                                        value=""
                                    />
                                    <img
                                        className="w-max h-max"
                                        src={sendIcon}
                                    />
                                    <DescriptionCaption
                                        topDistance={-30}
                                        text="Send message"
                                    ></DescriptionCaption>
                                </section>
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
