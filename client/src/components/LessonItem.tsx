import Link from "next/link";
import { Icon } from "@iconify/react"

interface LessonItemProps {
    id: string;
    lessonOrder: number;
    lessonTitle: string;
    isLearned?: boolean;
}

const LessonItem: React.FC<LessonItemProps> = ({
    id,
    lessonOrder,
    lessonTitle,
    isLearned = false,
}) => {
    return (
        <Link
            href={`/admin/lessons/${id}`}
        >
            <div className="flex flex-col gap-1.5 w-fit h-fit group">
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
        </Link >
    );
}

export default LessonItem;