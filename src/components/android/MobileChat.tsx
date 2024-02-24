type MobileChatProps = {
    children?: JSX.Element | JSX.Element[] | string;
    className: string
};

function MobileChat(props: MobileChatProps): JSX.Element {
    return (
        <main className={props.className}>
            {props.children}
        </main>
    );
}

export default MobileChat;