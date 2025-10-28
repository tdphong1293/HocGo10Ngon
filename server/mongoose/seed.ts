export const sessionModeData = [
    {
        modeName: 'time',
        config: { timeLimit: [30, 60, 90, 120] },
        subConfig: { number: true, punctuation: true, capitalization: true }
    },
    {
        modeName: 'words',
        config: { wordCount: [15, 25, 50, 100] },
        subConfig: { number: true, punctuation: true, capitalization: true }
    },
    {
        modeName: 'paragraphs',
        config: { paragraphLength: ['short', 'medium', 'long'] },
    },
    {
        modeName: 'row-based',
        config: { rows: ['home', 'top', 'bottom', 'home-top', 'home-bottom', 'top-bottom'] },
        subConfig: { wordCount: [15, 25, 50, 100] }
    }
]