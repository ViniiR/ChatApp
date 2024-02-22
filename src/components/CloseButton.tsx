import { MouseEventHandler } from "react";

type CloseButtonProps = {
    children?: JSX.Element | JSX.Element[] | string;
    className?: string;
    closeMenuFunction: MouseEventHandler<HTMLButtonElement>;
};

function CloseButton(props: CloseButtonProps): JSX.Element {
    return (
        <button
            className={`text-black w-10 h-10 inline-block relative ${props.className}`}
            onClick={props.closeMenuFunction}
        >
            <span
                className="w-10 h-1 bg-stone-700 rounded block absolute"
                style={{
                    transform: "rotate(45deg)",
                }}
            ></span>
            <span
                className="w-10 h-1 bg-stone-700 rounded block absolute"
                style={{
                    transform: "rotate(-45deg)",
                }}
            ></span>
        </button>
    );
}

export default CloseButton;
