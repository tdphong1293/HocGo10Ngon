
interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
    state?: boolean;
    setState?: (state: boolean) => void;
}

const Switch: React.FC<SwitchProps> = ({
    state,
    setState,
    ...props
}) => {
    const trackClass = `block w-10 h-6 rounded-full border-2 border-border group-hover:border-3 group-hover:scale-110 ${state ? 'bg-primary/30' : 'bg-secondary/30'} transition-colors`;
    const thumbClass = `dot absolute left-1 top-1 w-4 h-4 rounded-full transition-all group-hover:scale-110 ${state ? 'translate-x-4 bg-primary-foreground' : 'bg-secondary-foreground'}`;

    return (
        <label className="flex items-center cursor-pointer" role="switch" aria-checked={!!state}>
            <input
                type="checkbox"
                className="sr-only"
                checked={!!state}
                onChange={e => setState && setState(e.target.checked)}
                {...props}
            />
            <div className="relative group">
                <div className={trackClass} />
                <div className={thumbClass} />
            </div>
        </label>
    );
}

export default Switch;