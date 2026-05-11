import { useMemo } from "react";

interface CustomHorizontalBarChartProps {
    chartName?: string;
    chartData: { name: string; value: number; postText?: string }[] | null;
}

const CustomHorizontalBarChart: React.FC<CustomHorizontalBarChartProps> = ({
    chartName,
    chartData,
}) => {
    const maxValue = useMemo(() => {
        if (!chartData) return 0;
        return Math.max(...chartData.map(item => item.value)) / 80 * 100;
    }, [chartData]);

    if (!chartData) {
        return (
            <div className="flex bg-card border-2 border-border p-5 items-center justify-center">
                <span className="text-xl">
                    Bạn chưa có dữ liệu thống kê nào cho {chartName ? `${chartName.toLowerCase()}` : "biểu đồ này"}
                </span>
            </div> 
        );
    }

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
                        <div className="z-10">{item.value}{item.postText}</div>
                        <div
                            className="absolute left-0 top-0 h-full bg-primary-400"
                            style={{ width: `${(item.value / maxValue) * 100}%` }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CustomHorizontalBarChart;