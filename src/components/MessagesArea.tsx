import { useEffect, useRef } from "react";

type MessagesAreaProps = {
    totalMessages: UserMessages[];
    isMobile?: boolean;
    className?: string;
    ulClassName?: string
    optionalStyles?: React.CSSProperties;
};

type MessageProps = {
    content: string;
    isOwner: boolean;
    timestamp: string;
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
                className="rounded p-2 bg-stone-700 w-max break-words flex justify-between gap-2 text-wrap"
                style={{ maxWidth: "60%" }}
            >
                <p className="w-max ">{content}</p>
                <p className="w-max min-w-10 h-full flex justify-end items-end">
                    {timestamp}
                </p>
            </li>
        </article>
    ) : (
        <></>
    );
}

function MessagesArea({ totalMessages, isMobile, className, ulClassName, optionalStyles }: MessagesAreaProps) {
    const ulRef = useRef<HTMLUListElement | null>(null);

    if (isMobile) {
        return (
            <section
                className={`background-bg-image-mountain ${className}`}
                style={optionalStyles}
            >
                <ul
                    className={`glass-effect ${ulClassName}`}
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
            </section>
        );
    }

    return (
        <section
            className={`w-full h-full overflow-y-scroll custom-scroll-bar background-bg-image-mountain`}
        >
            <ul
                className={`flex flex-col gap-1 w-full h-full custom-scroll-bar p-2 glass-effect`}
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
        </section>
    );
}

export default MessagesArea;
