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

const homeRowKeys = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\'', ':', '\"'];
const topRowKeys = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\', '{', '}', '|'];
const bottomRowKeys = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', '<', '>', '?'];

export const categorizedParagraphByRowKey = (text: string) => {
    const lowerText = text.toLowerCase();
    let usesHomeRow = false;
    let usesTopRow = false;
    let usesBottomRow = false;

    for (const char of lowerText) {
        if (homeRowKeys.includes(char)) {
            usesHomeRow = true;
        } else if (topRowKeys.includes(char)) {
            usesTopRow = true;
        } else if (bottomRowKeys.includes(char)) {
            usesBottomRow = true;
        }
    }

    switch (true) {
        case usesHomeRow && !usesTopRow && !usesBottomRow:
            return RowType.HOME;
        case usesTopRow && !usesHomeRow && !usesBottomRow:
            return RowType.TOP;
        case usesBottomRow && !usesHomeRow && !usesTopRow:
            return RowType.BOTTOM;
        case usesHomeRow && usesTopRow && !usesBottomRow:
            return RowType.HOME_TOP;
        case usesHomeRow && usesBottomRow && !usesTopRow:
            return RowType.HOME_BOTTOM;
        case usesTopRow && usesBottomRow && !usesHomeRow:
            return RowType.TOP_BOTTOM;
        case usesHomeRow && usesTopRow && usesBottomRow:
            return RowType.ALL;
        default:
            return null;
    }
}