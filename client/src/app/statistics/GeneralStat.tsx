

interface GeneralStatProps {
    chartData: {
        totalTime: number;
        bestWPM: number;
        avgWPM: number;
        bestCPM: number;
        avgCPM: number;
        avgAccuracy: number;
    }
}

const GeneralStat: React.FC<GeneralStatProps> = ({
    chartData
}) => {
    return (
        <div className="flex flex-col gap-2 bg-card border-2 border-border p-2 ">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border text-card-foreground">
                <div className="bg-card text-center p-2 flex flex-col justify-center gap-1">
                    <span className="text-sm">
                        Tổng thời gian luyện tập
                    </span>
                    <span className="text-4xl font-bold text-primary">
                        {chartData.totalTime}
                    </span>
                </div>
                <div className="bg-card text-center p-2 flex flex-col justify-center gap-1">
                    <span className="text-sm">Tốc độ gõ kỷ lục</span>
                    <span className="text-4xl font-bold text-primary">{chartData.bestWPM}
                        <span className="text-lg"> WPM</span>
                    </span>
                    <span className="text-4xl font-bold text-primary">{chartData.bestCPM}
                        <span className="text-lg"> CPM</span>
                    </span>
                </div>
                <div className="bg-card text-center p-2 flex flex-col justify-center gap-1">
                    <span className="text-sm">Tốc độ trung bình</span>
                    <span className="text-4xl font-bold text-primary">{chartData.avgWPM}
                        <span className="text-lg"> WPM</span>
                    </span>
                    <span className="text-4xl font-bold text-primary">{chartData.avgCPM}
                        <span className="text-lg"> CPM</span>
                    </span>
                </div>
                <div className="bg-card text-center p-2 flex flex-col justify-center gap-1">
                    <span className="text-sm">Độ chính xác trung bình</span>
                    <span className="text-4xl font-bold text-primary">{chartData.avgAccuracy}%</span>
                </div>
            </div>
        </div >
    );
}

export default GeneralStat;