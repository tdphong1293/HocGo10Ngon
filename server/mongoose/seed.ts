export const sessionModeData = [
    {
        modeName: 'time',
        config: { timeLimit: [30, 60, 90, 120] },
        subConfig: { number: [], punctuation: [], capitalization: [] }
    },
    {
        modeName: 'words',
        config: { wordCount: [15, 25, 50, 100] },
        subConfig: { number: [], punctuation: [], capitalization: [] }
    },
    {
        modeName: 'paragraphs',
        config: { paragraphLength: ['ALL', 'SHORT', 'MEDIUM', 'LONG'] },
    },
    {
        modeName: 'row-based',
        config: { rows: ['ALL', 'HOME', 'TOP', 'BOTTOM', 'HOME_TOP', 'HOME_BOTTOM', 'TOP_BOTTOM'] },
        subConfig: { wordCount: [15, 25, 50, 100] }
    }
]