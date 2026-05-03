import React, { useMemo, useState } from 'react';
import { twoCharacterKey, functionKey, letterKey, TopRowKeys, HomeRowKeys, BottomRowKeys } from '@/components/Keyboard';
import Tooltip from '@/components/Tooltip';
import Switch from '@/components/Switch';

interface KeyboardChartProps {
    keysData: { key: string; accuracy: number; avgLatency: number }[];
}

const twoCharacterKeys = [['~', '`'], ['!', '1'], ['@', '2'], ['#', '3'], ['$', '4'], ['%', '5'], ['^', '6'], ['&', '7'], ['*', '8'], ['(', '9'], [')', '0'], ['_', '-'], ['+', '='], ['{', '['], ['}', ']'], ['|', '\\'], [':', ';'], ['"', "'"], ['<', ','], ['>', '.'], ['?', '/']];

const KeyboardChart: React.FC<KeyboardChartProps> = ({
    keysData,
}) => {
    const [isUpperCase, setIsUpperCase] = useState<boolean>(false);
    const [chartMode, setChartMode] = useState<"accuracy" | "speed">("accuracy");
    const keysDataMap = keysData.reduce((acc: Record<string, { accuracy: number; avgLatency: number }>, keyData: { key: string; accuracy: number; avgLatency: number }) => {
        acc[keyData.key] = { accuracy: keyData.accuracy, avgLatency: keyData.avgLatency };
        return acc;
    }, {});

    const keyToPairMap = useMemo(() => {
        const map: Record<string, string[]> = {};
        for (const pair of twoCharacterKeys) {
            for (const k of pair) {
                map[k] = pair;
            }
        }
        return map;
    }, [twoCharacterKeys]);

    const getColorClass = (key: string) => {
        let keyData = keysDataMap[key];
        const isTwoCharacterKey = keyToPairMap[key] !== undefined;
        if (isTwoCharacterKey) {
            const pair = keyToPairMap[key];
            // filter cho trường hợp key không có data
            const pairData = pair.map(k => keysDataMap[k]).filter(data => data);
            // trường hợp 2 key đều không có data
            if (pairData.length === 0) return '';
            if (pairData.length === 1) {
                keyData = pairData[0];
            } else {
                keyData = pairData.reduce((acc, data) => {
                    acc.accuracy += data.accuracy / pairData.length;
                    acc.avgLatency += data.avgLatency / pairData.length;
                    return acc;
                }, { accuracy: 0, avgLatency: 0 });
            }
        }

        if (!keyData) return '';

        if (chartMode === "accuracy") {
            const { accuracy } = keyData;
            if (accuracy >= 0.9) return ' bg-correct/75';
            if (accuracy >= 0.7) return ' bg-untyped/75';
            return ' bg-incorrect/75';
        }

        if (chartMode === "speed") {
            const { avgLatency } = keyData;
            if (avgLatency <= 100) return ' bg-correct/75';
            if (avgLatency <= 200) return ' bg-untyped/75';
            return ' bg-incorrect/75';
        }

        return '';
    };

    return (
        <div className="flex flex-col gap-2 bg-card border-2 border-border p-4 min-w-fit">
            <div className="text-2xl">Độ thành thạo bàn phím</div>
            <div className="flex flex-col md:flex-row gap-2">
                <div className="flex flex-col gap-2 md:w-1/3">
                    <div>
                        Bàn phím được tô màu thể hiện độ thành thạo của bạn với từng phím, dựa trên độ chính xác hoặc tốc độ gõ của bạn.
                    </div>
                    <div className="flex gap-1">
                        <Tooltip text="Không có dữ liệu">
                            <div className="w-8 h-8 border-2 border-border rounded-md"></div>
                        </Tooltip>
                        <Tooltip text={chartMode === "accuracy" ? "Độ chính xác < 70%" : "Tốc độ > 200ms"}>
                            <div className="w-8 h-8 border-2 border-border rounded-md bg-incorrect/75"></div>
                        </Tooltip>
                        <Tooltip text={chartMode === "accuracy" ? "Độ chính xác >= 70% và < 90%" : "Tốc độ > 100ms và <= 200ms"}>
                            <div className="w-8 h-8 border-2 border-border rounded-md bg-untyped/75"></div>
                        </Tooltip>
                        <Tooltip text={chartMode === "accuracy" ? "Độ chính xác >= 90%" : "Tốc độ <= 100ms"}>
                            <div className="w-8 h-8 border-2 border-border rounded-md bg-correct/75"></div>
                        </Tooltip>
                    </div>
                </div>
                <div className="flex flex-col gap-2 min-w-fit md:w-2/3 items-end">
                    <div className="flex gap-10">
                        <div className="flex gap-2 items-center">
                            <span>Chữ {isUpperCase ? 'hoa' : 'thường'}</span>
                            <Switch
                                state={isUpperCase}
                                setState={setIsUpperCase}
                            />
                        </div>
                        <div className="flex bg-secondary rounded-lg">
                            <button
                                onClick={() => setChartMode("accuracy")}
                                className={`px-5 py-2 rounded-md text-sm font-medium transition-all duration-200 ${chartMode === "accuracy"
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "text-foreground/70 hover:text-foreground cursor-pointer"
                                    }`}
                            >
                                Độ chính xác
                            </button>

                            <button
                                onClick={() => setChartMode("speed")}
                                className={`px-5 py-2 rounded-md text-sm font-medium transition-all duration-200 ${chartMode === "speed"
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "text-foreground/70 hover:text-foreground cursor-pointer"
                                    }`}
                            >
                                Tốc độ gõ
                            </button>
                        </div>
                    </div>
                    <div className="w-full flex justify-center">
                        <div className="bg-secondary p-2 rounded-md w-fit">
                            <div className={`keyboard-fixed-font flex flex-col max-w-xl w-full`}>
                                <div className={`flex`}>
                                    {twoCharacterKey(['~', '`'], [], 'small', 'w-1/16' + getColorClass('`'))}
                                    {twoCharacterKey(['!', '1'], [], 'small', 'w-1/16' + getColorClass('1'))}
                                    {twoCharacterKey(['@', '2'], [], 'small', 'w-1/16' + getColorClass('2'))}
                                    {twoCharacterKey(['#', '3'], [], 'small', 'w-1/16' + getColorClass('3'))}
                                    {twoCharacterKey(['$', '4'], [], 'small', 'w-1/16' + getColorClass('4'))}
                                    {twoCharacterKey(['%', '5'], [], 'small', 'w-1/16' + getColorClass('5'))}
                                    {twoCharacterKey(['^', '6'], [], 'small', 'w-1/16' + getColorClass('6'))}
                                    {twoCharacterKey(['&', '7'], [], 'small', 'w-1/16' + getColorClass('7'))}
                                    {twoCharacterKey(['*', '8'], [], 'small', 'w-1/16' + getColorClass('8'))}
                                    {twoCharacterKey(['(', '9'], [], 'small', 'w-1/16' + getColorClass('9'))}
                                    {twoCharacterKey([')', '0'], [], 'small', 'w-1/16' + getColorClass('0'))}
                                    {twoCharacterKey(['_', '-'], [], 'small', 'w-1/16' + getColorClass('-'))}
                                    {twoCharacterKey(['+', '='], [], 'small', 'w-1/16' + getColorClass('='))}
                                    {functionKey('Backspace', [], 'small', 'w-3/16')}
                                </div>
                                <div className={`flex`}>
                                    {functionKey('Tab', [], 'small', 'w-2/17' + getColorClass('\t'))}
                                    {isUpperCase
                                        ? TopRowKeys.map((key) => letterKey(key.toUpperCase(), [], 'small', 'w-1/17' + getColorClass(key.toUpperCase())))
                                        : TopRowKeys.map((key) => letterKey(key.toLowerCase(), [], 'small', 'w-1/17' + getColorClass(key.toLowerCase())))
                                    }
                                    {twoCharacterKey(['{', '['], [], 'small', 'w-1/17' + getColorClass('['))}
                                    {twoCharacterKey(['}', ']'], [], 'small', 'w-1/17' + getColorClass(']'))}
                                    {twoCharacterKey(['|', '\\'], [], 'small', 'w-3/17' + getColorClass('\\'))}
                                </div>
                                <div className={`flex`}>
                                    {functionKey('Caps Lock', [], 'small', 'w-4/19')}
                                    {isUpperCase
                                        ? HomeRowKeys.map((key) => letterKey(key.toUpperCase(), [], 'small', 'w-1/19' + getColorClass(key.toUpperCase())))
                                        : HomeRowKeys.map((key) => letterKey(key.toLowerCase(), [], 'small', 'w-1/19' + getColorClass(key.toLowerCase())))
                                    }
                                    {twoCharacterKey([':', ';'], [], 'small', 'w-1/19' + getColorClass(';'))}
                                    {twoCharacterKey(['"', "'"], [], 'small', 'w-1/19' + getColorClass("'"))}
                                    {functionKey('Enter', [], 'small', 'w-6/19' + getColorClass('\n'))}
                                </div>
                                <div className={`flex`}>
                                    {functionKey('LShift', [], 'small', 'w-4/22')}
                                    {isUpperCase
                                        ? BottomRowKeys.map((key) => letterKey(key.toUpperCase(), [], 'small', 'w-1/19' + getColorClass(key.toUpperCase())))
                                        : BottomRowKeys.map((key) => letterKey(key.toLowerCase(), [], 'small', 'w-1/19' + getColorClass(key.toLowerCase())))
                                    }
                                    {twoCharacterKey(['<', ','], [], 'small', 'w-1/19' + getColorClass(','))}
                                    {twoCharacterKey(['>', '.'], [], 'small', 'w-1/19' + getColorClass('.'))}
                                    {twoCharacterKey(['?', '/'], [], 'small', 'w-1/19' + getColorClass('/'))}
                                    {functionKey('RShift', [], 'small', 'w-5/19')}
                                </div>
                                <div className={`flex`}>
                                    {functionKey('LCtrl', [], 'small', 'w-1/11')}
                                    {functionKey('LWin', [], 'small', 'w-1/11')}
                                    {functionKey('LAlt', [], 'small', 'w-1/11')}
                                    {functionKey('Space', [], 'small', 'w-5/11' + getColorClass(' '))}
                                    {functionKey('RAlt', [], 'small', 'w-1/11')}
                                    {functionKey('RWin', [], 'small', 'w-1/11')}
                                    {functionKey('Menu', [], 'small', 'w-1/11')}
                                    {functionKey('RCtrl', [], 'small', 'w-1/11')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default KeyboardChart;