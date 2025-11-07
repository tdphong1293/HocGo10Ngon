
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    className?: string;
}

const Textarea: React.FC<TextareaProps> = ({
    className,
    ...props
}) => {
    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Tab') {
            event.preventDefault();
            const textarea = event.currentTarget;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            textarea.value = textarea.value.substring(0, start) + '\t' + textarea.value.substring(end);
            textarea.selectionStart = textarea.selectionEnd = start + 1;
        }
        props.onChange?.(event as unknown as React.ChangeEvent<HTMLTextAreaElement>);
    };

    return (
        <textarea
            className={`focus:outline-none focus:ring-1 focus:ring-ring resize-none ${className}`}
            style={{ tabSize: 4 }}
            onKeyDown={handleKeyDown}
            {...props}
        />
    );
};

export default Textarea;
