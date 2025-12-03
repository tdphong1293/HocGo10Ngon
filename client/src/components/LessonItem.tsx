import Link from "next/link";
import { Icon } from "@iconify/react"

interface LessonItemProps {
    id: string;
    lessonOrder: number;
    lessonTitle: string;
    isLearned?: boolean;
    disabled?: boolean;
    isAdmin?: boolean;
}

const LessonItem: React.FC<LessonItemProps> = ({
    id,
    lessonOrder,
    lessonTitle,
    isLearned = false,
    disabled = false,
    isAdmin = false,
}) => {
    const content = (
        <div className="flex flex-col gap-1.5 w-fit h-fit group relative">
            {disabled && (
                <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-accent rounded-full w-4 h-4 z-10"></div>
            )}
            <div className={`bg-card text-card-foreground border-2 border-border rounded-md shadow-sm flex flex-col gap-2 justify-center items-center w-25 h-25 group-hover:scale-105 group-hover:-translate-y-1 duration-300 transition-transform relative`}>
                {isLearned ? (
                    <>
                        <span className="absolute top-0.5 left-1.5 text-xl">{lessonOrder}</span>
                        <Icon icon="material-symbols:check-circle-rounded" className="text-primary/50 group-hover:text-primary text-5xl" />
                    </>
                ) : (
                    <div
                        className="w-15 h-15 rounded-full border-border border-2 flex justify-center items-center text-2xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200"
                    >
                        {lessonOrder}
                    </div>
                )}
            </div>
            <div className="text-center group-hover:font-bold transition-normal duration-200">{lessonTitle}</div>
        </div>
    )

    if (disabled) {
        return content;
    }
    else {
        return (
            <Link
                href={isAdmin ? `/admin/lessons/${id}` : `/lessons/${id}`}
            >
                {content}
            </Link >
        );
    }
}

export default LessonItem;