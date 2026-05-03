
interface CustomDonutChartProps {
    chartName?: string;
    chartData: {
        goalText: string;
        goalValue: number;
        progressText: string;
        progressValue: number;
        extraText?: string;
    }[];
}

const CustomDonutChart: React.FC<CustomDonutChartProps> = ({
    chartName,
    chartData,
}) => {
    const radius = 70; // Bán kính của vòng tròn
    const stroke = 8; // Độ dày của đường viền
    const normalizedRadius = radius - stroke / 2; // Bán kính vẽ được điều chỉnh để đường viền nằm trong vòng tròn
    const circumference = 2 * Math.PI * normalizedRadius; // Chu vi của vòng tròn

    return (
        <div className="flex flex-col gap-2 bg-card border-2 border-border p-4">
            {chartName && <div className="text-2xl">{chartName}</div>}
            <div className="flex flex-col sm:flex-row flex-wrap gap-5 justify-center">
                {chartData.map((item, index) => {
                    const strokeDashoffset = item.progressValue >= item.goalValue ? 0 : circumference * (1 - item.progressValue / item.goalValue); // Phần trăm chưa hoàn thành

                    return (
                        <div
                            className="flex flex-col items-center"
                            key={"donut_" + item.goalText + "_" + item.progressText + "_" + index}
                        >
                            <div className="text-center max-w-40 text-foreground">
                                {item.progressText}
                            </div>
                            <div className="w-40 h-40 flex items-center justify-center relative">
                                <svg
                                    height="100%"
                                    width="100%"
                                    className="absolute top-0 left-0 -rotate-90"
                                >
                                    // Vòng tròn nền
                                    <circle
                                        stroke="currentColor"
                                        className="text-primary/30"
                                        fill="transparent"
                                        strokeWidth={stroke}
                                        r={normalizedRadius}
                                        cx="50%"
                                        cy="50%"
                                    />

                                    // Vòng tròn tiến trình
                                    <circle
                                        stroke="currentColor"
                                        className="text-primary transition-all duration-300"
                                        fill="transparent"
                                        strokeWidth={stroke * 2}
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="butt"
                                        r={normalizedRadius}
                                        cx="50%"
                                        cy="50%"
                                    />
                                </svg>

                                <div className="flex flex-col text-foreground z-10">
                                    <div className="text-lg text-center">Mục tiêu:</div>
                                    <div className="text-2xl font-bold text-center">{item.goalText}</div>
                                </div>
                            </div>
                            {item.extraText && (
                                <div className="text-md text-center max-w-40 text-foreground">
                                    {item.extraText}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    );
}

export default CustomDonutChart;