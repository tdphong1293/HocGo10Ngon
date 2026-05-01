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