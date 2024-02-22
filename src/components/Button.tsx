import { MouseEventHandler } from "react";

type ButtonProps = {
    children: JSX.Element | JSX.Element[] | string;
    className?: string
    onClickDo: MouseEventHandler
};

function Button(props: ButtonProps): JSX.Element {
    return (
        <button onClick={props.onClickDo} className={`w-full h-10 bg-blue-600 rounded text-white font-semibold ${props.className}`}>
            {props.children}
        </button>
    );
}

export default Button;