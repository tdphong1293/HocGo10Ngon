import { formatTimeTextLong } from "@/lib/timeFormat";

interface GeneralStatProps {
    chartData: {
        totalTime: number;
        bestWPM: number;
        avgWPM: number;
        bestCPM: number;
        avgCPM: number;
        avgAccuracy: number;
    } | null;
}

const GeneralStat: React.FC<GeneralStatProps> = ({
    chartData
}) => {
    if (!chartData) {
        return (
            <div className="flex bg-card border-2 border-border p-5 items-center justify-center">
                <span className="text-xl">
                    Bạn chưa có dữ liệu thống kê nào cho phần tổng quan
                </span>
            </div> 
        );
    }

    return (
        <div className="flex flex-col gap-2 bg-card border-2 border-border p-2" >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border text-card-foreground">
                <div className="bg-card text-center p-2 flex flex-col justify-center gap-1">
                    <span className="text-sm">
                        Tổng thời gian luyện tập
                    </span>
                    <span className="text-2xl font-bold text-primary">
                        {formatTimeTextLong(chartData.totalTime)}
                    </span>
                </div>
                <div className="bg-card text-center p-2 flex flex-col justify-center gap-1">
                    <span className="text-sm">Tốc độ gõ kỷ lục</span>
                    <span className="text-2xl font-bold text-primary">{Math.round(chartData.bestWPM)}
                        <span className="text-lg"> WPM</span>
                    </span>
                    <span className="text-2xl font-bold text-primary">{Math.round(chartData.bestCPM)}
                        <span className="text-lg"> CPM</span>
                    </span>
                </div>
                <div className="bg-card text-center p-2 flex flex-col justify-center gap-1">
                    <span className="text-sm">Tốc độ trung bình</span>
                    <span className="text-2xl font-bold text-primary">{Math.round(chartData.avgWPM)}
                        <span className="text-lg"> WPM</span>
                    </span>
                    <span className="text-2xl font-bold text-primary">{Math.round(chartData.avgCPM)}
                        <span className="text-lg"> CPM</span>
                    </span>
                </div>
                <div className="bg-card text-center p-2 flex flex-col justify-center gap-1">
                    <span className="text-sm">Độ chính xác trung bình</span>
                    <span className="text-2xl font-bold text-primary">{(chartData.avgAccuracy).toFixed(2)}%</span>
                </div>
            </div>
        </div >
    );
}

export default GeneralStat;