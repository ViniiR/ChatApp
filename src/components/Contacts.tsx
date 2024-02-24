import { useContext } from "react";
import { UserInfoContext } from "./ProtectedRoutes";

type ContactsProps = {
    openChat: CallableFunction;
    className?: string
};
function Contacts({ openChat, className }: ContactsProps) {
    const { contactsList } = useContext(UserInfoContext);
    return (
        <ul
            className={`bg-stone-900 border-r ps-2 border-stone-600 overflow-y-auto custom-scroll-bar ${className}`}
            style={{ height: "calc(100% - 56px)" }}
        >
            {contactsList.map((contact, index) =>
                contact.name ? (
                    <li
                        className="w-full border-b border-stone-600 h-14 flex items-center p-2 cursor-pointer hover:bg-stone-700"
                        key={index}
                        onClick={() => openChat(contact.name)}
                    >
                        {contact.name}
                    </li>
                ) : (
                    null
                )
            )}
        </ul>
    );
}

export default Contacts;
