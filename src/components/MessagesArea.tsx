import { useEffect, useRef } from "react";

type MessagesAreaProps = {
    totalMessages: UserMessages[];
};

type MessageProps = {
    content: string;
    isOwner: boolean;
    timestamp: string
};

function Message({ content, isOwner, timestamp }: MessageProps) {
    const messageRef = useRef<HTMLElement>(null);
    useEffect(() => {
        messageRef.current?.scrollIntoView();
    }, []);
    return content ? (
        <article
            ref={messageRef}
            className="w-full flex"
            style={{
                justifyContent: isOwner ? "end" : "start",
            }}
        >
            <li
                className="rounded p-2 bg-stone-800 w-max break-words flex justify-between gap-2 text-wrap"
                style={{ maxWidth: "60%" }}
            >
                <p className="w-max ">{content}</p>
                <p className="w-max min-w-10 h-full flex justify-end items-end">{timestamp}</p>
            </li>
        </article>
    ) : (
        <></>
    );
}

function MessagesArea({ totalMessages }: MessagesAreaProps) {
    const ulRef = useRef<HTMLUListElement | null>(null);

    return (
        <ul
            className="flex flex-col gap-1 w-full h-full p-2 overflow-y-scroll custom-scroll-bar"
            ref={ulRef}
        >
            {totalMessages.map((element, index) => (
                <Message
                    key={index}
                    content={element.content}
                    isOwner={element.isOwner}
                    timestamp={element.currentTime}
                ></Message>
            ))}
        </ul>
    );
}

export default MessagesArea;
