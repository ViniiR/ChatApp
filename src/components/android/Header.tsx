type HeaderProps = {
    children?: JSX.Element | JSX.Element[] | string;
    className: string
};

function Header(props: HeaderProps): JSX.Element {
    return (
        <header className={props.className} style={{height: '56px'}}>
            {props.children}
        </header>
    );
}

export default Header;