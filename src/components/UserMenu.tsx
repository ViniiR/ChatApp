import { RefObject } from "react";

type UserMenuProps = {
    children?: JSX.Element | JSX.Element[] | string;
    reference: RefObject<HTMLDivElement>;
    className?: string;
};

function UserMenu(props: UserMenuProps): JSX.Element {
    return (
        <div
            ref={props.reference}
            className={`absolute w-screen h-screen bg-black bg-opacity-45 hidden place-items-center text-black`}
        >
            <section
                className={`rounded w-1/3 p-2 bg-white ${props.className}`}
            >
                {props.children}
            </section>
        </div>
    );
}

export default UserMenu;
