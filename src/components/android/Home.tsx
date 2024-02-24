type HomeProps = {
    children?: JSX.Element | JSX.Element[] | string;
    className?: string
};

function Home(props: HomeProps): JSX.Element {
    return (
        <main className={props.className}>
            {props.children}
        </main>
    );
}

export default Home;