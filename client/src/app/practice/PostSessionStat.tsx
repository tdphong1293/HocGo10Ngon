import PostSessionLineChart from './PostSessionLineChart';
import { Keystroke, TypingStats } from '@/components/TypingPractice';
import { Icon } from '@iconify/react';
import { useMemo, JSX } from 'react';
import { diff_match_patch, DIFF_DELETE, DIFF_EQUAL, DIFF_INSERT } from 'diff-match-patch';

interface PostSessionStatProps {
    keystrokeLog: Keystroke[];
    typingStats: TypingStats;
    inputHistory: string;
    text: string;
    author?: string | null;
    source?: string | null;
}

const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const PostSessionStat: React.FC<PostSessionStatProps> = ({
    keystrokeLog,
    typingStats,
    inputHistory,
    text,
    author,
    source,
}) => {
    const diffs = useMemo(() => {
        const dmp = new diff_match_patch();
        const d = dmp.diff_main(text, inputHistory);
        dmp.diff_cleanupSemantic(d);
        return d;
    }, [text, inputHistory]);

    const renderChar = (char: string, isCorrect: boolean, i: number) => {
        if (char === ' ') {
            return (
                <span key={`s-${i}`} className={`inline-block w-[1ch] ${isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    &nbsp;
                </span>
            );
        }
        if (char === '\n') {
            return (
                <span key={`n-${i}`} className={isCorrect ? 'text-green-500' : 'text-red-500'}>
                    <Icon icon="fluent:arrow-enter-left-24-regular" className="inline-block align-middle" />
                </span>
            );
        }
        if (char === '\t') {
            return (
                <span key={`t-${i}`} className={isCorrect ? 'text-green-500' : 'text-red-500'}>
                    <Icon icon="fluent:keyboard-tab-24-regular" className="inline-block align-middle" />
                </span>
            );
        }
        return (
            <span key={`c-${i}`} className={isCorrect ? 'text-green-500' : 'text-red-500 font-bold'}>
                {char}
            </span>
        );
    };

    return (
        <div className="w-full px-10 flex flex-col gap-0">
            <div className={`flex gap-2 ${!author || !source ? 'items-center' : 'items-start'}`}>
                <div className="flex flex-col gap-5">
                    <div className="flex gap-2 items-end">
                        <span className="text-4xl font-bold">{typingStats.wpm.toFixed(2)}</span>
                        <span className="">WPM</span>
                    </div>
                    <div className="flex gap-2 items-end">
                        <span className="text-4xl font-bold">{typingStats.cpm.toFixed(2)}</span>
                        <span className="">CPM</span>
                    </div>
                    <div className="flex gap-2 items-end">
                        <span className="text-4xl font-bold">{typingStats.raw.toFixed(2)}</span>
                        <span className="">Raw</span>
                    </div>
                    <div className="flex gap-2 items-end">
                        <span className="text-4xl font-bold">{typingStats.accuracy.toFixed(2)}%</span>
                        <span className="">Accuracy</span>
                    </div>
                    <div className="flex gap-5">
                        <div className="flex gap-2 items-end">
                            <span className="">Time: </span>
                            <span className="text-3xl font-bold">{formatTime(typingStats.elapsed)}</span>
                        </div>
                        <div className="flex gap-2 items-end">
                            <span className="">Errors:</span>
                            <span className="text-3xl font-bold">{typingStats.errors}</span>
                        </div>
                    </div>
                    <div className="flex gap-2 items-end">
                        <span className="">Đã gõ</span>
                        <span className="text-4xl font-bold">{typingStats.words}</span>
                        <span className="">từ</span>
                    </div>
                    {author && (
                        <div className="flex gap-2 items-end">
                            <span className="">Tác giả:</span>
                            <span className="text-3xl font-bold">{author}</span>
                        </div>
                    )}
                    {source && (
                        <div className="flex gap-2 items-end">
                            <span className="">Nguồn:</span>
                            <span className="text-3xl font-bold">{source}</span>
                        </div>
                    )}
                </div>
                <PostSessionLineChart keystrokeLog={keystrokeLog} />
            </div>

            <div className="flex flex-col gap-2">
                <span className="font-semibold text-lg">Lịch sử gõ:</span>
                <div className="bg-accent/30 rounded-lg p-4 border border-border">
                    <div className="font-mono text-md whitespace-pre-wrap break-words text-accent-foreground leading-loose">
                        {(() => {
                            let outIndex = 0;
                            const nodes: JSX.Element[] = [];
                            diffs.forEach(([op, data], idx) => {
                                if (op === DIFF_EQUAL) {
                                    for (let j = 0; j < data.length; j++) {
                                        nodes.push(renderChar(data[j], true, outIndex++));
                                    }
                                } else if (op === DIFF_INSERT) {
                                    for (let j = 0; j < data.length; j++) {
                                        nodes.push(renderChar(data[j], false, outIndex++));
                                    }
                                } else if (op === DIFF_DELETE) {
                                    // Skips expected-but-not-typed chars in the input history view
                                }
                            });
                            return nodes;
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PostSessionStat;