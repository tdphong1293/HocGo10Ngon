import { LengthType, RowType } from "src/generated/client/enums";

export const categorizedParagraphByLength = (text: string) => {
    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount < 50) {
        return LengthType.SHORT;
    } else if (wordCount <= 150) {
        return LengthType.MEDIUM;
    } else {
        return LengthType.LONG;
    }
}