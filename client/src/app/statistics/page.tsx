'use client';

import KeyboardChart from "./KeyboardChart";

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

    return (
        <div>
            <h1>Statistics Page</h1>
            <p>This is the statistics page.</p>
            <KeyboardChart keysData={keysData}/>
        </div>
    )
};

export default StatisticsPage;