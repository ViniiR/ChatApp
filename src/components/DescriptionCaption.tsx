type DescriptionCaptionProps = {
    text: string;
    topDistance: number;
};

function DescriptionCaption({ text, topDistance }: DescriptionCaptionProps) {
    return (
        <div
            className="caption-hover absolute p-1 right-0 w-max h-max rounded hidden bg-zinc-800 text-sm"
            style={{ top: `${topDistance}px` }}
        >
            {text}
        </div>
    );
}

export default DescriptionCaption;
