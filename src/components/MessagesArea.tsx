type MessagesAreaProps = {
    messagesArray: { content: string; isOwner: boolean }[];
};
function MessagesArea({ messagesArray }: MessagesAreaProps) {
    return (
        <ul
            className="w-full h-full p-2 grid gap-1 overflow-y-scroll"
            style={{
                gridTemplateRows: `repeat(${messagesArray.length}, max-content)`,
            }}
        >
            {messagesArray.map((element, index) =>
                element.content.length > 0 ? (
                    <div key={index} className="w-full h-max bg-transparent flex"
                    style={{justifyContent: element.isOwner ? 'end' : 'start'}}
                    >
                        <li
                            className="rounded bg-stone-700 break-words p-2 text-wrap w-max"
                            style={{whiteSpace: 'initial', maxWidth: '50%'}}
                            //TODO: add styling for owner or not
                        >
                            {element.content}
                        </li>
                    </div>
                ) : (
                    <li key={index} className="hidden"></li>
                )
            )}
        </ul>
    );
}

export default MessagesArea;
