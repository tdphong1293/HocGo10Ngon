export const sessionModeData = [
    {
        modeName: 'time',
        config: { timeLimit: [30, 60, 90, 120] },
        subConfig: { number: {}, punctuation: {}, capitalization: {} }
    },
    {
        modeName: 'words',
        config: { wordCount: [15, 25, 50, 100] },
        subConfig: { number: {}, punctuation: {}, capitalization: {} }
    },
    {
        modeName: 'paragraphs',
        config: { paragraphLength: ['all', 'short', 'medium', 'long'] },
    },
    {
        modeName: 'row-based',
        config: { rows: ['all', 'home', 'top', 'bottom', 'home-top', 'home-bottom', 'top-bottom'] },
        subConfig: { wordCount: [15, 25, 50, 100] }
    }
]