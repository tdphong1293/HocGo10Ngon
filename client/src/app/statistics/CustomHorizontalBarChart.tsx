import { useMemo } from "react";

interface CustomHorizontalBarChartProps {
    chartName?: string;
    chartData: { name: string; value: number; postText?: string }[];
}

const CustomHorizontalBarChart: React.FC<CustomHorizontalBarChartProps> = ({
    chartName,
    chartData,
}) => {
    const maxValue = useMemo(() => {
        return Math.max(...chartData.map(item => item.value)) / 80 * 100;
    }, [chartData]);

    return (
        <div className="flex flex-col gap-2 bg-card border-2 border-border p-4 ">
            {chartName && <div className="text-2xl">{chartName}</div>}
            <div className="flex flex-col gap-2">
                {chartData.map((item) => (
                    <div
                        key={item.name}
                        className="flex justify-between bg-secondary p-2 relative"
                    >
                        <div className="z-10">{item.name}</div>
                        <div className="z-10">{item.value} {item.postText}</div>
                        <div
                            className="absolute left-0 top-0 h-full bg-primary/50"
                            style={{ width: `${(item.value / maxValue) * 100}%` }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CustomHorizontalBarChart;