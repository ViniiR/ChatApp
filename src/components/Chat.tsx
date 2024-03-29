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
import { useFormik } from "formik";
import axios from "axios";
import { SERVER_URL } from "@/environment";
import sendIcon from "@assets/sendMessage.png";
import addFriendIcon from "@/assets/addFriend.png";
import removeFriendIcon from "@assets/removeFriend.png";
import DescriptionCaption from "./DescriptionCaption";
import Menu from "./Menu";
import CloseButton from "./CloseButton";
import Button from "./Button";
import { useNavigate } from "react-router-dom";
import Error from "./Error";
import { friendSchema } from "@/schema";
import Home from "./android/Home";
import Header from "./android/Header";
import MobileChat from "./android/MobileChat";
import homeIcon from "@assets/homeButton.png";

function Chat() {
    const { userName } = useContext(UserInfoContext);
    const navigateTo = useNavigate();
    const userMenuRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [currentContactName, setCurrentContactName] = useState("");
    const socket = useContext(SocketContext);
    const [userMessages, setUserMessages] = useState<UserMessages[]>([]);
    const textInputRef = useRef<HTMLInputElement>(null);
    const [contactsList, setContactsList] = useState<Array<{ name: string }>>(
        []
    );
    const [isOnline, setIsOnline] = useState("Offline");

    const [timeoutID, setTimeoutID] = useState<number | null>(null);

    //mobile only
    const mobileUserMenuRef = useRef<HTMLDivElement>(null);
    const mobileAddFriendMenuRef = useRef<HTMLDivElement>(null);
    const [isChatting, setIsChatting] = useState(false);

    const friendFormik = useFormik({
        initialValues: {
            friendName: "",
        },
        validationSchema: friendSchema,
        async onSubmit(values: { friendName: string }, { setStatus }) {
            try {
                const res = await axios.patch(
                    `${SERVER_URL}/users/add-contact`,
                    { userName: values.friendName },
                    {
                        withCredentials: true,
                    }
                );
                setStatus(res.data);
                navigateTo("/");
            } catch (err) {
                const message = (err as { response: { data: string } }).response
                    .data;
                if (typeof message !== "string") {
                    setStatus("Error");
                    return;
                }
                setStatus(message);
            }
        },
    });

    async function getContactsList() {
        const infoRes = await axios.get(`${SERVER_URL}/users/info`, {
            withCredentials: true,
        });
        const contacts: { name: string }[] = [];
        infoRes.data.userInfo.contacts.forEach((element: string, i: number) => {
            contacts[i] = {
                name: element,
            };
        });
        setContactsList(contacts);
    }

    async function emitOnlineState() {
        try {
            socket.emit("updateUserState", {
                name: userName,
                state: "Online",
                contact: currentContactName,
            });
        } catch (err) {
            console.error(err);
        }
    }

    //connects to socket.io
    useEffect(() => {
        socket.connect();
        return () => {
            socket.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    //emits current user's state to db
    useEffect(() => {
        function setStateChangeOnline() {
            socket.emit("updateUserState", {
                name: userName,
                state: "Online",
                contact: currentContactName,
            });
        }
        function setStateChangeOffline() {
            socket.emit("updateUserState", {
                name: userName,
                state: "Offline",
                contact: currentContactName,
            });
        }

        setStateChangeOnline();

        window.addEventListener("beforeunload", setStateChangeOffline);

        return () => {
            window.removeEventListener("beforeunload", setStateChangeOffline);
            setStateChangeOffline();
        };
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentContactName]);

    async function artificiallyEmitOnlineState() {
        try {
            socket.emit("updateUserState", {
                name: userName,
                state: "Online",
                contact: currentContactName,
            });
            updateContactState(currentContactName)
        } catch (err) {
            console.error(err);
        }
    }

    async function updateContactState(name: string) {
        if (!name) return;
        try {
            const res = await axios.get(`${SERVER_URL}/users/friend-info`, {
                params: {
                    userName: name,
                },
            });
            console.log(res.data);
            if (!res.data.state) {
                setIsOnline("Offline");
                return;
            }
            setIsOnline(res.data.state);
        } catch (err) {
            console.error(err);
        }
    }

    async function emitTyping() {
        try {
            //FIXME: the currentContact being talked to's state becomes offline
            clearTimeout(timeoutID!);
            socket.emit("updateUserState", {
                name: userName,
                state: "Typing...",
            });
            updateContactState(currentContactName);
            setTimeoutID(window.setTimeout(artificiallyEmitOnlineState, 3000));
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        async function getContactInitialState(name: string) {
            if (!name) return;
            try {
                const res = await axios.get(`${SERVER_URL}/users/friend-info`, {
                    params: {
                        userName: name,
                    },
                });
                if (!res.data.state) {
                    setIsOnline("Offline");
                    return;
                }
                setIsOnline(res.data.state);
            } catch (err) {
                console.error(err);
            }
        }

        getContactInitialState(currentContactName);
    }, [currentContactName]);
    //gets friend initial online state
    useEffect(() => {
        function stateChangeHandler(data: { name: string; state: string }) {
            if (data.name === currentContactName) {
                setIsOnline(data.state);
            } else {
                setIsOnline("Offline");
            }
        }

        socket.on("contactStateChange", stateChangeHandler);

        return () => {
            socket.off("contactStateChange", stateChangeHandler);
        };
    }, [currentContactName, socket]);

    //updates the contacts list
    useEffect(() => {
        getContactsList();
    }, []);

    //joins room
    useEffect(() => {
        if (!currentContactName) return;
        socket.emit("joinRoom", {
            client1: userName,
            client2: currentContactName,
        });
        //TODO: query the database with the contact name to get its current onlineState, and set it as setIsOnline()
        //empties array of messages so messages between users don't overlap
        setUserMessages([]);
        textInputRef.current?.focus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentContactName]);

    //handles incoming messages
    useEffect(() => {
        const messageHandler = (data: {
            owner: string;
            content: string;
            currentTime: string;
        }) => {
            setUserMessages((previousMessages) => [
                ...previousMessages,
                {
                    content: data.content,
                    isOwner: data.owner === userName,
                    currentTime: data.currentTime,
                },
            ]);
        };
        socket.on("message", messageHandler);
        return () => {
            socket.off("message", messageHandler);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, userName]);

    //gets messages when user enters room
    useEffect(() => {
        const storedMessagesHandler = (
            data: {
                content: string;
                owner: string;
                timestamp: string;
            }[]
        ) => {
            const messages: UserMessages[] = data.map((item) => ({
                content: item.content,
                currentTime: item.timestamp,
                isOwner: item.owner === userName,
            }));
            setUserMessages(messages);
        };
        socket.on("roomStoredMessages", storedMessagesHandler);
        return () => {
            socket.off("roomStoredMessages", storedMessagesHandler);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket]);

    async function removeContact() {
        try {
            await axios.patch(`${SERVER_URL}/users/remove-friend`, {
                name: currentContactName,
                userName: userName,
            });
            getContactsList();
            navigateTo("/");
        } catch (err) {
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
        async onSubmit(values, { resetForm }) {
            if (values.message.trim().length < 1) {
                return;
            }

            const date = new Date();
            const hours = date.getHours().toString().padStart(2, "0");
            const minutes = date.getMinutes().toString().padStart(2, "0");

            const currentTime = `${hours}:${minutes}`;

            const messageData: Message = {
                content: values.message,
                owner: userName,
                sentTo: currentContactName,
                currentTime,
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

    function destroyEscEvent() {
        document.removeEventListener("keydown", escEvent);
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
            escEventListener = null;
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

    function returnToHome() {
        setIsChatting(false);
        setCurrentContactName("");
    }

    //mobile only, lets the code know if the user is on a chat or not
    useEffect(() => {
        if (!currentContactName) {
            setIsChatting(false);
            return;
        }
        setIsChatting(true);
    }, [currentContactName]);

    if (window.outerWidth <= 450) {
        return !isChatting ? (
            <Home className="h-screen w-full text-white">
                <Menu
                    reference={mobileUserMenuRef}
                    className="flex flex-col w-5/6 gap-5"
                >
                    <section className="flex w-full justify-between items-center">
                        <strong>Settings</strong>
                        <CloseButton
                            closeMenuFunction={(event) => {
                                closeGenericMenu(event, mobileUserMenuRef);
                            }}
                        ></CloseButton>
                    </section>
                    <section className="flex flex-col gap-1">
                        <Button onClickDo={logOut}>LogOut</Button>
                        <Button onClickDo={deleteAccount}>
                            Delete Account
                        </Button>
                    </section>
                </Menu>
                <Menu
                    reference={mobileAddFriendMenuRef}
                    className="w-5/6 flex flex-col gap-1 items-end"
                >
                    <CloseButton
                        closeMenuFunction={(event) => {
                            closeGenericMenu(event, mobileAddFriendMenuRef);
                        }}
                    ></CloseButton>
                    <form
                        action=""
                        method="POST"
                        onSubmit={friendFormik.handleSubmit}
                        className="p-2 gap-1 flex flex-col w-full"
                    >
                        <label className="font-semibold" htmlFor="friendName">
                            Friend Username:
                        </label>
                        <input
                            className="rounded p-2 border w-full border-stone-700"
                            type="text"
                            name="friendName"
                            id="friendName"
                            onChange={(event) => {
                                friendFormik.handleChange(event);
                                friendFormik.setStatus("");
                            }}
                        />
                        <Error
                            text={
                                friendFormik.errors.friendName ||
                                friendFormik.status
                            }
                            className="text-red-600 h-10 flex items-center"
                        ></Error>
                        <input
                            className="rounded p-2 bg-blue-600 w-full text-white"
                            type="submit"
                            value="Add"
                        />
                    </form>
                </Menu>
                <Header className="bg-stone-700 flex items-center w-full p-2 justify-between">
                    <strong>{userName}</strong>
                    <section className="flex items-center p-2 gap-3">
                        <button
                            onClick={(event) => {
                                showGenericMenu(event, mobileAddFriendMenuRef);
                            }}
                            className="flex w-8 h-8 justify-center hover:bg-stone-700 rounded-full show-caption-hover relative"
                        >
                            <img
                                src={addFriendIcon}
                                className="w-full h-full"
                                alt=""
                            />
                        </button>
                        <menu
                            className="w-8 cursor-pointer h-8 flex flex-col justify-around *:hover:bg-stone-500"
                            onClick={(event) => {
                                showGenericMenu(event, mobileUserMenuRef);
                            }}
                        >
                            <span className="w-full h-1 bg-stone-600 block rounded"></span>
                            <span className="w-full h-1 bg-stone-600 block rounded"></span>
                            <span className="w-full h-1 bg-stone-600 block rounded"></span>
                        </menu>
                    </section>
                </Header>
                <Contacts
                    contactsList={contactsList}
                    className="p-2"
                    openChat={setCurrentContactName}
                ></Contacts>
            </Home>
        ) : (
            <MobileChat className="min-h-screen h-screen text-white">
                <header className="fixed h-16 w-full text-white bg-stone-700 p-2 items-center flex z-10 top-0 justify-between">
                    <p className="flex flex-col gap-1">
                        <span className="font-semibold text-lg">
                            {currentContactName}
                        </span>
                        <span
                            className="text-zinc-400"
                            style={{
                                color:
                                    isOnline === "Online"
                                        ? "lightgreen"
                                        : isOnline === "Offline"
                                        ? "red"
                                        : "gray",
                            }}
                        >
                            {isOnline}
                        </span>
                    </p>
                    <section className="flex gap-5">
                        <button
                            onClick={removeContact}
                            className="flex w-8 h-8 justify-center hover:bg-stone-700 rounded-full p-1 relative show-caption-hover"
                        >
                            <img
                                src={removeFriendIcon}
                                className="w-7"
                                alt=""
                            />
                        </button>
                        <button onClick={returnToHome} className="w-8 h-8">
                            <img className="w-full" src={homeIcon} alt="" />
                        </button>
                    </section>
                </header>
                <MessagesArea
                    isMobile={true}
                    className="fixed w-full overflow-y-scroll"
                    ulClassName="p-2 h-max min-h-full flex flex-col gap-1"
                    optionalStyles={{
                        height: "calc(100% - 128px)",
                        top: "64px",
                        bottom: "64px",
                    }}
                    totalMessages={userMessages}
                ></MessagesArea>
                <footer className="h-16 w-full fixed bottom-0 p-2 bg-stone-700">
                    <form
                        action=""
                        method="post"
                        className="w-full h-full flex items-center gap-1"
                        onSubmit={formik.handleSubmit}
                    >
                        <input
                            onKeyDown={emitTyping}
                            onKeyUp={emitOnlineState}
                            onChange={formik.handleChange}
                            type="text"
                            value={formik.values.message}
                            autoFocus={true}
                            ref={textInputRef}
                            autoComplete="off"
                            name="message"
                            id="message"
                            placeholder="Type here"
                            className="w-full placeholder:text-stone-300 rounded p-4 bg-stone-500 h-full outline-none"
                        />
                        <section
                            className="w-10 cursor-pointer flex items-center justify-center rounded-full hover:bg-stone-700 h-full relative show-caption-hover"
                            onClick={(event) => {
                                formik.handleSubmit(
                                    event as unknown as React.FormEvent<HTMLFormElement>
                                );
                            }}
                        >
                            <img className="w-max h-max" src={sendIcon} />
                        </section>
                    </form>
                </footer>
            </MobileChat>
        );
    }

    return (
        <main className="h-screen flex w-full bg-stone-800 text-white text-base">
            <Menu reference={menuRef} className="flex flex-col gap-5">
                <section className="flex justify-between w-full items-center">
                    <strong>Add Friend</strong>
                    <CloseButton
                        closeMenuFunction={(event) => {
                            closeGenericMenu(event, menuRef);
                        }}
                    ></CloseButton>
                </section>
                <section>
                    <form
                        noValidate
                        method="POST"
                        className="flex flex-col gap-1"
                        onSubmit={friendFormik.handleSubmit}
                    >
                        <label className="font-semibold" htmlFor="friendName">
                            Username:
                        </label>
                        <input
                            onChange={friendFormik.handleChange}
                            className="w-full rounded border border-stone-600 h-10 p-2"
                            type="text"
                            name="friendName"
                            id="friendName"
                        />
                        <Error
                            className="text-red-600 h-10 flex items-center"
                            text={
                                friendFormik.errors.friendName ||
                                friendFormik.status
                            }
                        ></Error>
                        <input
                            value={"Add"}
                            type="submit"
                            className="w-full rounded bg-blue-600 text-white h-10 hover:bg-blue-500 cursor-pointer"
                        />
                    </form>
                </section>
            </Menu>
            <Menu reference={userMenuRef} className="flex flex-col gap-1">
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
            </Menu>
            <section
                className="flex flex-col h-full"
                style={{ width: "400px" }}
            >
                <header className="flex bg-stone-800 h-14 p-2 justify-between items-center border-r border-stone-600">
                    <div>{userName}</div>
                    <section className="flex items-center gap-3">
                        <button
                            onClick={(event) => {
                                showGenericMenu(event, menuRef);
                            }}
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
                <Contacts
                    contactsList={contactsList}
                    openChat={setCurrentContactName}
                ></Contacts>
            </section>
            <section className="flex flex-row justify-between bg-stone-700 w-full h-full">
                {currentContactName ? (
                    <section className="bg-stone-600 w-full flex flex-col justify-between">
                        <header className="h-14 p-2 flex items-center justify-between bg-stone-800">
                            <section className="w-10 flex flex-col justify-between p-2">
                                <h2 className="font-semibold text-lg h h-2/3">
                                    {currentContactName}
                                </h2>
                                <p
                                    className="h-1/3 text-sm text-neutral-400"
                                    style={{
                                        color:
                                            isOnline === "Online"
                                                ? "lightgreen"
                                                : isOnline === "Offline"
                                                ? "red"
                                                : "gray",
                                    }}
                                >
                                    {isOnline}
                                </p>
                            </section>
                            <button
                                onClick={removeContact}
                                className="flex w-8 h-8 justify-center hover:bg-stone-700 rounded-full p-1 relative show-caption-hover"
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
                        <footer className="h-14 flex items-center bg-stone-800 p-2">
                            <form
                                action=""
                                method="post"
                                className="w-full h-full flex items-center gap-1"
                                onSubmit={formik.handleSubmit}
                            >
                                <input
                                    onKeyDown={emitTyping}
                                    onChange={formik.handleChange}
                                    type="text"
                                    value={formik.values.message}
                                    autoFocus={true}
                                    ref={textInputRef}
                                    autoComplete="off"
                                    name="message"
                                    id="message"
                                    placeholder="Type here"
                                    className="w-full placeholder:text-stone-300 rounded p-4 bg-stone-500 h-full outline-none"
                                />
                                {/* <section className="w-10 cursor-pointer flex items-center justify-center rounded-full hover:bg-stone-700 h-full relative show-caption-hover">
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
                                        topDistance={-40}
                                        text="Send message"
                                    ></DescriptionCaption>
                                </section> */}
                            </form>
                        </footer>
                    </section>
                ) : (
                    <section className="grid place-items-center w-full bg-stone-700 h-full relative">
                        <p className="idle-animation">No Chat selected</p>
                    </section>
                )}
            </section>
        </main>
    );
}

export default Chat;
