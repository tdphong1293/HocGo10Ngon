import { SortableItem } from "./SortableItem";
import LessonItem from "./LessonItem";

const SortableLessonItem: React.FC<React.ComponentProps<typeof LessonItem>> = ({
    id,
    lessonOrder,
    lessonTitle,
    isLearned = false,
}) => {
    return (
        <SortableItem id={id}>
            <LessonItem
                id={id}
                lessonOrder={lessonOrder}
                lessonTitle={lessonTitle}
                isLearned={isLearned}
                disabled={true}
            />
        </SortableItem>
    );
}

export default SortableLessonItem;