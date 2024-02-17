import { useContext } from "react";
import { UserInfoContext } from "./ProtectedRoutes";

type ContactsProps = {
    openChat: CallableFunction
}
function Contacts({openChat}: ContactsProps) {
    const { contactsList } = useContext(UserInfoContext);
    return (
        <ul className="bg-stone-800 overflow-y-auto" style={{ height: "calc(100% - 56px)" }}>
            {contactsList.map((contact, index) => (
                <li
                    className="w-full border border-stone-600 h-14 flex items-center p-2 cursor-pointer hover:bg-stone-700"
                    key={index}
                    onClick={() => openChat(contact.name)}
                >
                    {contact.name}
                </li>
            ))}
        </ul>
    );
}

export default Contacts;