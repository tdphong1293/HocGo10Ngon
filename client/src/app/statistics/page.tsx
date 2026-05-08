'use client';

import KeyboardChart from "./KeyboardChart";
import CustomHorizontalBarChart from "./CustomHorizontalBarChart";
import CustomDonutChart from "./CustomDonutChart";
import GeneralStat from "./GeneralStat";
import ActiveWebtimePieChart from "./ActiveWebtimePieChart";
import HandsChart from "./HandsChart";

const StatisticsPage = () => {
    const keysData = [
        { key: 'A', accuracy: 0.95, avgLatency: 120 },
        { key: 'S', accuracy: 0.85, avgLatency: 150 },
        { key: 'D', accuracy: 0.75, avgLatency: 200 },
        { key: 'F', accuracy: 0.65, avgLatency: 250 },
        { key: 'J', accuracy: 0.90, avgLatency: 110 },
        { key: 'K', accuracy: 0.80, avgLatency: 130 },
        { key: 'L', accuracy: 0.70, avgLatency: 180 },
        { key: 'a', accuracy: 0.92, avgLatency: 100 },
        { key: 's', accuracy: 0.82, avgLatency: 140 },
        { key: 'd', accuracy: 0.72, avgLatency: 190 },
        { key: 'f', accuracy: 0.62, avgLatency: 240 },
        { key: 'j', accuracy: 0.88, avgLatency: 90 },
        { key: 'k', accuracy: 0.78, avgLatency: 120 },
        { key: 'l', accuracy: 0.68, avgLatency: 170 },
    ]

    const barsData = [
        { name: "current speed", value: 200, postText: "ms" },
        { name: "average speed", value: 180, postText: "ms" },
        { name: "best speed", value: 220, postText: "ms" },
    ]

    const donutsData = [
        {
            goalText: "15 phút",
            goalValue: 15,
            progressText: "9 phút",
            progressValue: 9,
            extraText: "Hôm nay"
        },
        {
            goalText: "30 phút",
            goalValue: 30,
            progressText: "20 phút",
            progressValue: 20,
            extraText: "Tuần này"
        },
        {
            goalText: "45 phút",
            goalValue: 45,
            progressText: "30 phút",
            progressValue: 30,
            extraText: "Tuần trước"
        },
        {
            goalText: "60 phút",
            goalValue: 60,
            progressText: "45 phút",
            progressValue: 45,
            extraText: "Tháng này"
        },
        {
            goalText: "120 phút",
            goalValue: 120,
            progressText: "90 phút",
            progressValue: 90,
            extraText: "Tháng trước"
        }
    ]

    const generalStatData = {
        totalTime: 120,
        bestWPM: 80,
        avgWPM: 60,
        bestCPM: 400,
        avgCPM: 300,
        avgAccuracy: 95,
    }

    const activeWebtimeData = {
        day: {
            value: [
                { name: 'Success', value: 1000 },
                { name: 'Failed', value: 20 },
            ],
        },
        week: {
            value: [
                { name: 'Success', value: 5000 },
                { name: 'Failed', value: 100 },
            ],
        },
        month: {
            value: [
                { name: 'Success', value: 20000 },
                { name: 'Failed', value: 500 },
            ],
        }
    };

    const fingerStats = {
        left_pinky: { accuracy: 91, avgLatency: 220 },
        left_ring: { accuracy: 90, avgLatency: 205 },
        left_middle: { accuracy: 94, avgLatency: 180 },
        left_index: { accuracy: 95, avgLatency: 170 },
        right_index: { accuracy: 95, avgLatency: 165 },
        right_middle: { accuracy: 94, avgLatency: 175 },
        right_ring: { accuracy: 90, avgLatency: 210 },
        right_pinky: { accuracy: 89, avgLatency: 225 },
        thumb: { accuracy: 96, avgLatency: 150 },
    };

    return (
        <div className="p-4 flex flex-col gap-5 max-w-5xl mx-auto">
            <h1>Statistics Page</h1>
            <p>This is the statistics page.</p>
            <GeneralStat chartData={generalStatData} />
            <CustomHorizontalBarChart chartName="Tốc độ gõ theo thời gian" chartData={barsData} />
            <KeyboardChart keysData={keysData} />
            <CustomDonutChart chartName="Tiến độ mục tiêu" chartData={donutsData} />
            <ActiveWebtimePieChart chartData={activeWebtimeData} />
            <HandsChart fingersData={fingerStats} />
        </div>
    )
};

export default StatisticsPage;