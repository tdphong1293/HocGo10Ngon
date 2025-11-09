'use client';

import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useState } from 'react';
import { Keystroke } from './TypingPractice';

export interface ChartDataPoint {
    time: number;
    wpm: number;
    raw: number;
    burst: number;
    errors: number;
    hasError?: boolean;
}

interface PostSessionLineChartProps {
    keystrokeLog: Keystroke[];
    intervalSeconds?: number;
}

// Transform keystroke log into chart data points
const generateChartData = (
    keystrokeLog: Keystroke[],
    intervalSeconds: number = 5
): ChartDataPoint[] => {
    if (!keystrokeLog || keystrokeLog.length === 0) return [];

    const maxTime = Math.max(...keystrokeLog.map(k => k.timestamp));
    const intervals = Math.ceil(maxTime / 1000 / intervalSeconds);

    if (intervals > 1000) {
        console.warn('Too many intervals, limiting data points');
        return [];
    }

    if (intervals === 0 || isNaN(intervals) || !isFinite(intervals)) {
        console.warn('Invalid intervals calculated:', intervals);
        return [];
    }

    const data: ChartDataPoint[] = [];

    // Sort keystrokes by timestamp to ensure correct processing
    const sortedKeystrokes = [...keystrokeLog].sort((a, b) => a.timestamp - b.timestamp);

    // Process data in a single pass instead of filtering multiple times
    let cumulativeCorrect = 0;
    let cumulativeTotal = 0;
    let cumulativeErrors = 0;
    let strokeIndex = 0;

    for (let i = 1; i <= intervals; i++) {
        const timeMs = i * intervalSeconds * 1000;
        const intervalStart = (i - 1) * intervalSeconds * 1000;

        // Count strokes in this interval
        let intervalCorrect = 0;
        let intervalTotal = 0;
        let hasError = false;

        // Process keystrokes up to this time point
        while (strokeIndex < sortedKeystrokes.length && sortedKeystrokes[strokeIndex].timestamp <= timeMs) {
            const stroke = sortedKeystrokes[strokeIndex];

            if (stroke.timestamp > intervalStart) {
                // This stroke belongs to current interval
                intervalTotal++;
                if (stroke.correct) {
                    intervalCorrect++;
                } else {
                    hasError = true;
                }
            }

            // Update cumulative counts
            cumulativeTotal++;
            if (stroke.correct) {
                cumulativeCorrect++;
            } else {
                cumulativeErrors++;
            }

            strokeIndex++;
        }

        // Calculate metrics
        const minutes = (i * intervalSeconds) / 60;
        const wpm = minutes > 0 ? (cumulativeCorrect / 5) / minutes : 0;
        const raw = minutes > 0 ? (cumulativeTotal / 5) / minutes : 0;
        const burst = intervalTotal > 0 ? (intervalCorrect / 5) / (intervalSeconds / 60) : 0;

        data.push({
            time: i * intervalSeconds,
            wpm: Math.round(wpm * 100) / 100,
            raw: Math.round(raw * 100) / 100,
            burst: Math.round(burst * 100) / 100,
            errors: cumulativeErrors,
            hasError,
        });
    }

    return data;
};

// Custom error dot component
const ErrorDot = (props: any) => {
    const { cx, cy, payload } = props;

    if (payload.hasError) {
        return (
            <svg x={cx - 6} y={cy - 6} width={12} height={12}>
                <text
                    x="6"
                    y="10"
                    textAnchor="middle"
                    fill="var(--chart-error)"
                    fontSize="14"
                    fontWeight="bold"
                >
                    ×
                </text>
            </svg>
        );
    }
    return null;
};

// Custom Legend component to handle transparent stroke
const CustomLegend = ({ payload, onClick, hiddenLines }: any) => {
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    const renderLegendIcon = (dataKey: string, color: string) => {
        switch (dataKey) {
            case 'burst':
                // Dashed line
                return (
                    <svg width="25" height="12" style={{ overflow: 'visible' }}>
                        <line x1="0" y1="6" x2="25" y2="6" stroke={color} strokeWidth="2" strokeDasharray="5 5" />
                    </svg>
                );
            case 'raw':
                // Solid line with circles
                return (
                    <svg width="25" height="12" style={{ overflow: 'visible' }}>
                        <line x1="0" y1="6" x2="25" y2="6" stroke={color} strokeWidth="2" />
                        <circle cx="7" cy="6" r="3" fill={color} />
                        <circle cx="18" cy="6" r="3" fill={color} />
                    </svg>
                );
            case 'wpm':
                // Solid line
                return (
                    <svg width="25" height="12" style={{ overflow: 'visible' }}>
                        <line x1="0" y1="6" x2="25" y2="6" stroke={color} strokeWidth="2" />
                    </svg>
                );
            case 'errors':
                // X symbols
                return (
                    <svg width="5" height="12" style={{ overflow: 'visible' }}>
                        <text x="3" y="10" textAnchor="middle" fill={color} fontSize="14" fontWeight="bold">×</text>
                    </svg>
                );
            default:
                return (
                    <svg width="25" height="12" style={{ overflow: 'visible' }}>
                        <line x1="0" y1="6" x2="25" y2="6" stroke={color} strokeWidth="2" />
                    </svg>
                );
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            paddingTop: '10px',
            color: 'var(--accent-foreground)'
        }}>
            {payload.map((entry: any, index: number) => {
                const color = entry.dataKey === 'errors' ? 'var(--chart-error)' : entry.color;
                const isHidden = hiddenLines?.has(entry.dataKey);
                const isHovered = hoveredItem === entry.dataKey;

                return (
                    <div
                        key={`legend-${index}`}
                        onClick={() => onClick && onClick(entry)}
                        onMouseEnter={() => setHoveredItem(entry.dataKey)}
                        onMouseLeave={() => setHoveredItem(null)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            userSelect: 'none',
                            opacity: isHidden ? 0.4 : 1,
                            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                            transition: 'all 0.2s ease',
                            textDecoration: isHidden ? 'line-through' : 'none'
                        }}
                    >
                        {renderLegendIcon(entry.dataKey, color)}
                        <span style={{
                            color: 'var(--accent-foreground)',
                            fontWeight: isHovered ? 'bold' : 'normal'
                        }}>
                            {entry.value}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div
                style={{
                    backgroundColor: 'var(--popover)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    padding: '8px 12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
            >
                <p style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--popover-foreground)' }}>
                    {label}
                </p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <div
                            style={{
                                width: '12px',
                                height: '12px',
                                backgroundColor: entry.stroke === 'transparent' ? 'var(--chart-error)' : entry.stroke,
                                opacity: entry.strokeOpacity || 1,
                                border: '1px solid rgba(0,0,0,0.1)'
                            }}
                        />
                        <span style={{ color: 'var(--popover-foreground)', fontSize: '14px' }}>
                            {entry.name} : {entry.value}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const PostSessionLineChart: React.FC<PostSessionLineChartProps> = ({
    keystrokeLog,
    intervalSeconds = 1,
}) => {
    const [hiddenLines, setHiddenLines] = useState<Set<string>>(new Set());

    const handleLegendClick = (dataKey: string) => {
        setHiddenLines(prev => {
            const newSet = new Set(prev);
            if (newSet.has(dataKey)) {
                newSet.delete(dataKey);
            } else {
                newSet.add(dataKey);
            }
            return newSet;
        });
    };

    // Early return if no data
    if (!keystrokeLog || keystrokeLog.length === 0) {
        return (
            <div className="w-full h-[300px] flex items-center justify-center text-accent-foreground/50">
                No data to display
            </div>
        );
    }

    const chartData = generateChartData(keystrokeLog, intervalSeconds);

    if (chartData.length === 0) {
        return (
            <div className="w-full h-[300px] flex items-center justify-center text-accent-foreground/50">
                No data to display
            </div>
        );
    }

    // Calculate appropriate tick interval for X-axis
    const maxTime = chartData[chartData.length - 1]?.time || 0;
    const tickInterval = intervalSeconds >= 5 ? intervalSeconds : Math.max(intervalSeconds, Math.ceil(maxTime / 10));

    // Generate ticks ensuring the first tick is always included
    const ticks = chartData
        .filter((d) => d.time % tickInterval === 0 || d.time === chartData[0].time)
        .map(d => d.time)
        .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates

    return (
        <ResponsiveContainer
            width="100%"
            height={450}
            debounce={50}
            className={`[&_*]:focus:outline-none`}
        >
            <LineChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
            >
                <CartesianGrid
                    stroke="var(--border)"
                    strokeDasharray="2 2"
                    strokeWidth={1.5}
                    yAxisId="left"
                />
                <XAxis
                    dataKey="time"
                    label={{ value: 'Time (seconds)', position: 'insideBottom', offset: -10, fill: 'var(--accent-foreground)' }}
                    stroke="var(--accent-foreground)"
                    tick={{ fill: 'var(--accent-foreground)', fontSize: 12 }}
                    ticks={ticks}
                    domain={[1, 'dataMax']}
                    type="number"
                />
                <YAxis
                    yAxisId="left"
                    label={{ value: 'Words per Minute', angle: -90, position: 'center', dx: -15, fill: 'var(--accent-foreground)' }}
                    stroke="var(--accent-foreground)"
                    tick={{ fill: 'var(--accent-foreground)', fontSize: 12 }}
                />
                <YAxis
                    yAxisId="right"
                    orientation="right"
                    label={{ value: 'Errors', angle: 90, position: 'center', dx: 15, fill: 'var(--chart-error)' }}
                    stroke="var(--chart-error)"
                    tick={{ fill: 'var(--chart-error)', fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    content={<CustomLegend onClick={(entry: any) => entry.dataKey && handleLegendClick(entry.dataKey)} hiddenLines={hiddenLines} />}
                    wrapperStyle={{ paddingTop: '20px' }}
                />

                <Line
                    type="monotone"
                    dataKey="burst"
                    stroke="var(--chart-burst)"
                    strokeWidth={1.5}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Burst"
                    yAxisId="left"
                    hide={hiddenLines.has('burst')}
                />

                <Line
                    type="monotone"
                    dataKey="raw"
                    stroke="var(--chart-raw)"
                    strokeWidth={2.5}
                    dot={{ fill: 'var(--chart-raw)', r: 2 }}
                    name="Raw"
                    strokeOpacity={0.85}
                    yAxisId="left"
                    hide={hiddenLines.has('raw')}
                />

                <Line
                    type="monotone"
                    dataKey="wpm"
                    stroke="var(--chart-wpm)"
                    strokeWidth={2.5}
                    dot={false}
                    name="WPM"
                    yAxisId="left"
                    hide={hiddenLines.has('wpm')}
                />

                <Line
                    type="monotone"
                    dataKey="errors"
                    stroke="transparent"
                    strokeDasharray="2 2"
                    dot={<ErrorDot />}
                    activeDot={false}
                    isAnimationActive={false}
                    name="Errors"
                    yAxisId="right"
                    hide={hiddenLines.has('errors')}
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default PostSessionLineChart;