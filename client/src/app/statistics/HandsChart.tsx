import Hands from "@/components/Hands";
import type { FingerId, FingerStat } from "@/components/Hands";
import { useMemo } from "react";

interface HandsChartProps {
    fingersData: Partial<Record<FingerId, FingerStat>> | null;
}

const HandsChart: React.FC<HandsChartProps> = ({
    fingersData
}) => {
    let sumLeftAccuracy = 0;
    let sumLeftLatency = 0;
    let countLeft = 0;

    let sumRightAccuracy = 0;
    let sumRightLatency = 0;
    let countRight = 0;

    const handsData = useMemo(() => {
        if (!fingersData) return { leftAvgAccuracy: 0, leftAvgLatency: 0, rightAvgAccuracy: 0, rightAvgLatency: 0 };

        for (const key in fingersData) {
            if (key.startsWith("left_")) {
                sumLeftAccuracy += fingersData[key as FingerId]?.accuracy || 0;
                sumLeftLatency += fingersData[key as FingerId]?.avgLatency || 0;
                countLeft++;
            }
            if (key.startsWith("right_")) {
                sumRightAccuracy += fingersData[key as FingerId]?.accuracy || 0;
                sumRightLatency += fingersData[key as FingerId]?.avgLatency || 0;
                countRight++;
            }
        }

        const leftAvgAccuracy = countLeft > 0 ? sumLeftAccuracy / countLeft : 0;
        const leftAvgLatency = countLeft > 0 ? Math.round(sumLeftLatency / countLeft) : 0;
        const rightAvgAccuracy = countRight > 0 ? sumRightAccuracy / countRight : 0;
        const rightAvgLatency = countRight > 0 ? Math.round(sumRightLatency / countRight) : 0;
        return { leftAvgAccuracy, leftAvgLatency, rightAvgAccuracy, rightAvgLatency };
    }, [fingersData]);

    return (
        <div
            className="flex flex-col gap-2 bg-card border-2 border-border p-4 min-w-fit"
        >
            <div className="text-2xl">Độ chính xác và độ trễ theo từng ngón tay</div>
            <div className="flex flex-col md:flex-row gap-2">
                <div className="flex flex-col gap-2 md:w-1/3">
                    <div>
                        Các ngón tay có độ chính xác và độ trễ tốt hơn sẽ có màu đậm hơn, trong khi các ngón tay có hiệu suất kém hơn sẽ có màu nhạt hơn.
                    </div>
                    <div className="flex w-full gap-2 md:flex-col md:gap-0">
                        <div className="border-r border-b-0 md:border-b md:border-r-0 border-border px-2 md:py-1 flex justify-between items-center w-full">
                            <span>Tay trái</span>
                            <div className="flex flex-col gap-0.5 text-sm font-bold text-end">
                                <span>
                                    {handsData.leftAvgLatency}ms
                                </span>
                                <span>
                                    {(handsData.leftAvgAccuracy).toFixed(2)}%
                                </span>
                            </div>
                        </div>
                        <div className="border-r border-b-0 md:border-b md:border-r-0 border-border px-2 md:py-1 flex justify-between items-center w-full">
                            <span>Tay phải</span>
                            <div className="flex flex-col gap-0.5 text-sm font-bold text-end">
                                <span>
                                    {handsData.rightAvgLatency}ms
                                </span>
                                <span>
                                    {(handsData.rightAvgAccuracy).toFixed(2)}%
                                </span>
                            </div>
                        </div>
                        <div className="border-b-0 md:border-b md:border-r-0 border-border px-2 md:py-1 flex justify-between items-center w-full">
                            <span>Ngón cái</span>
                            <div className="flex flex-col gap-0.5 text-sm font-bold text-end">
                                <span>
                                    {Math.round(fingersData?.["thumb"]?.avgLatency || 0)}ms
                                </span>
                                <span>
                                    {(fingersData?.["thumb"]?.accuracy || 0).toFixed(2)}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-8 min-w-fit md:w-2/3 justify-center">
                    {fingersData ? (
                        <>
                            <Hands
                                side="left"
                                stats={fingersData}
                            />
                            <Hands
                                side="right"
                                stats={fingersData}
                            />
                        </>
                    ) : (
                        <div className="flex min-w-fit md:w-2/3 justify-center items-center p-10 text-lg">
                            Không có dữ liệu ngón tay để hiển thị
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HandsChart;