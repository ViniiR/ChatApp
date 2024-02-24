type ErrorProps = {
    text: string;
    className: string;
}

function Error({text, ...rest}: ErrorProps) {
    return (
        <p {...rest}>
            {text}
        </p>
    );
}

export default Error;