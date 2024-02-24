type DescriptionCaptionProps = {
    text: string;
    topDistance: number;
};

function DescriptionCaption({ text, topDistance }: DescriptionCaptionProps) {
    return (
        <div
            className="caption-hover absolute p-2 right-0 w-max h-max rounded hidden z-10 bg-zinc-700 text-sm"
            style={{ top: `${topDistance}px` }}
        >
            {text}
        </div>
    );
}

export default DescriptionCaption;
