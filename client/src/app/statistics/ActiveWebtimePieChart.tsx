import { Cell, Pie, PieChart, Label } from "recharts";
import { useState } from "react";
import { formatTime } from "@/lib/timeFormat";

interface LabelProps {
    midAngle?: number;
    middleRadius?: number;
    name?: string | number;
    percent?: number;
    value: number;
    cx: number;
    cy: number;
    innerRadius: number;
    outerRadius: number;
    index: number
}

const createLabelRenderer = (data: { name: string; value: number }[]) => {
    return (props: LabelProps) => {
        const { value, index, midAngle = 0, outerRadius, cx, cy } = props;
        const dataEntry = data[index];
        const name = dataEntry?.name || '';
        const color = index % 2 === 0 ? "var(--primary)" : "var(--destructive)";
        const RADIAN = Math.PI / 180;
        const isRight = Math.cos(-midAngle * RADIAN) >= 0;
        const textAnchor = isRight ? 'start' : 'end';
        const side = isRight ? 1 : -1;

        const lineStartX = cx + outerRadius * Math.cos(-midAngle * RADIAN);
        const lineStartY = cy + outerRadius * Math.sin(-midAngle * RADIAN);
        const elbowX1 = cx + (outerRadius + 20) * Math.cos(-midAngle * RADIAN);
        const elbowY1 = cy + (outerRadius + 20) * Math.sin(-midAngle * RADIAN);
        const elbowX2 = cx + (outerRadius + 20) * side;
        const elbowY2 = elbowY1;
        const labelX = elbowX2 + 5 * side;
        const labelY = elbowY2;

        const len1 = Math.hypot(elbowX1 - lineStartX, elbowY1 - lineStartY);
        const len2 = Math.hypot(elbowX2 - elbowX1, elbowY2 - elbowY1);

        if (value === 0) {
            return null;
        }

        return (
            <g key={`label-${index}`}>
                <line
                    x1={lineStartX}
                    y1={lineStartY}
                    x2={elbowX1}
                    y2={elbowY1}
                    stroke={color}
                    strokeWidth="1.5"
                    opacity="0.8"
                    style={{
                        strokeDasharray: len1,
                        strokeDashoffset: len1,
                        animation: "draw-line 200ms ease forwards",
                    }}
                />
                <line
                    x1={elbowX1}
                    y1={elbowY1}
                    x2={elbowX2}
                    y2={elbowY2}
                    stroke={color}
                    strokeWidth="1.5"
                    opacity="0.8"
                    style={{
                        strokeDasharray: len2,
                        strokeDashoffset: len2,
                        animation: "draw-line 200ms ease 200ms forwards",
                    }}
                />
                <circle
                    cx={elbowX2}
                    cy={elbowY2}
                    r={3}
                    fill={color}
                    style={{
                        opacity: 0,
                        animation: "fade-in 200ms ease 400ms forwards"
                    }}
                />
                <text
                    x={labelX}
                    y={labelY}
                    textAnchor={textAnchor}
                    dominantBaseline="central"
                    fontSize="13"
                    fontWeight="600"
                    style={{
                        opacity: 0,
                        animation: "fade-in 200ms ease 400ms forwards",
                    }}
                >
                    <tspan
                        x={labelX}
                        dy="0"
                        fill={"var(--card-foreground)"}
                    >
                        {name}
                    </tspan>
                    <tspan
                        x={labelX}
                        dy="1.4em"
                        fill={color}
                        fontSize="12"
                        fontWeight="400"
                    >
                        {formatTime(value)}
                    </tspan>
                </text>
            </g>
        );
    };
};

interface ActiveWebtimePieChartProps {
    chartData: Record<
        "today" | "this_week" | "overall",
        { name: string; value: number }[]
    > | null;
}

const ActiveWebtimePieChart: React.FC<ActiveWebtimePieChartProps> = ({
    chartData
}) => {
    const [chartMode, setChartMode] = useState<"today" | "this_week" | "overall">("today");

    const totalSeconds = chartData?.[chartMode]?.reduce((sum, d) => sum + d.value, 0) || 0;
    const totalLabel = formatTime(totalSeconds);
    const startAngle = 90;
    const endAngle = -270;
    const renderLabel = createLabelRenderer(chartData?.[chartMode] || []);

    if (!chartData) {
        return (
            <div className="flex bg-card border-2 border-border p-5 items-center justify-center">
                <span className="text-xl">
                    Bạn chưa có dữ liệu thống kê nào cho thời gian luyện tập
                </span>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2 bg-card border-2 border-border p-4">
            <div className="text-2xl">Thời gian luyện tập</div>
            <div className="flex flex-col gap-0 justify-center items-center">
                <PieChart
                    responsive
                    className="min-w-80 min-h-80 w-full h-full max-w-full max-h-100 aspect-square"
                >
                    <Pie
                        data={chartData?.[chartMode] || []}
                        startAngle={startAngle}
                        endAngle={endAngle}
                        dataKey="value"
                        innerRadius={"50%"}
                        outerRadius={"60%"}
                        paddingAngle={0}
                        label={renderLabel}
                        labelLine={false}
                    >
                        {chartData?.[chartMode]?.map((entry, index) => {
                            if (entry.value === 0) {
                                return null;
                            }

                            return (
                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "var(--primary)" : "var(--destructive)"} />
                            );
                        })}
                    </Pie>
                    <Label
                        content={(props) => {
                            if (!props.viewBox) return null;
                            // Typescript báo lỗi không có cx, cy trên props viewBox nên cast để tránh lỗi
                            const { cx, cy } = props.viewBox as unknown as { cx: number; cy: number };

                            return (
                                <text
                                    x={cx}
                                    y={cy}
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fontSize="14"
                                    fontWeight="600"
                                    fill="var(--card-foreground)"
                                    style={{
                                        opacity: totalSeconds > 0 ? 0 : 1,
                                        animation: totalSeconds > 0 ? "fade-in 200ms ease 600ms forwards" : "none",
                                    }}
                                >
                                    {totalSeconds > 0 ? totalLabel : "Chưa có dữ liệu"}
                                </text>
                            );
                        }}
                    />
                </PieChart>
                <div className="flex bg-secondary rounded-lg w-fit">
                    {(['today', 'this_week', 'overall'] as const).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setChartMode(mode)}
                            className={`px-5 py-2 rounded-md text-sm font-medium transition-all duration-200 ${chartMode === mode
                                ? "bg-primary text-primary-foreground shadow-md"
                                : "text-foreground/70 hover:text-foreground cursor-pointer"
                                }`}
                        >
                            {mode === 'today' ? 'Hôm nay' : mode === 'this_week' ? 'Tuần này' : 'Toàn bộ'}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ActiveWebtimePieChart;
