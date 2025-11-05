export const categorizedParagraphByLength = (text: string) => {
    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount < 50) {
        return 'SHORT';
    } else if (wordCount <= 150) {
        return 'MEDIUM';
    } else {
        return 'LONG';
    }
}