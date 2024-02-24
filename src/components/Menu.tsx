import { RefObject } from "react";

type MenuProps = {
    children?: JSX.Element | JSX.Element[] | string;
    reference: RefObject<HTMLDivElement>;
    className?: string;
};

function Menu(props: MenuProps): JSX.Element {
    return (
        <div
            ref={props.reference}
            className={`absolute z-10 w-screen h-screen bg-black bg-opacity-45 hidden place-items-center text-black`}
        >
            <section
                className={`rounded w-1/3 p-2 bg-white ${props.className}`}
            >
                {props.children}
            </section>
        </div>
    );
}

export default Menu;
