'use client';

import { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from '@/components/LoadingSpinner';
import { getUserActiveWebtime, getUserAttempts, getUserFingerStats, getUserKeyStats, getUserKeyTypeLatency, getUserTypingStats, getUserTypingStatsByTime } from "@/services/stat.services";
import { toast } from "react-toastify";
import KeyboardChart from "./KeyboardChart";
import CustomHorizontalBarChart from "./CustomHorizontalBarChart";
import CustomDonutChart from "./CustomDonutChart";
import GeneralStat from "./GeneralStat";
import ActiveWebtimePieChart from "./ActiveWebtimePieChart";
import HandsChart from "./HandsChart";
import SessionAttempts from "./SessionAttempts";

const StatisticsPage = () => {
    const { isAuthenticated, accessToken, user, loading, requireAuth, refreshToken } = useAuth();
    const isGuest = !isAuthenticated || !accessToken || !user;
    const [authChecked, setAuthChecked] = useState(false);
    const [statsLoading, setStatsLoading] = useState(true);
    const [generalStatData, setGeneralStatData] = useState<{
        totalTime: number;
        bestWPM: number;
        avgWPM: number;
        bestCPM: number;
        avgCPM: number;
        avgAccuracy: number;
    } | null>(null);
    const [typingSpeedByTimeData, setTypingSpeedByTimeData] = useState<any>(null);
    const [typingLatencyByKeyTypeData, setTypingLatencyByKeyTypeData] = useState<any>(null);
    const [activeWebtimeData, setActiveWebtimeData] = useState<any>(null);
    const [keyStatsData, setKeyStatsData] = useState<any>(null);
    const [fingerStatsData, setFingerStatsData] = useState<any>(null);
    const [sessionAttemptsData, setSessionAttemptsData] = useState<any>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const result = await requireAuth();
            setAuthChecked(result);
        };
        checkAuth();
    }, []);

    useEffect(() => {
        if (authChecked && !isGuest && accessToken) {
            const fetchStats = async () => {
                try {
                    const responses = await Promise.all([
                        getUserTypingStats(accessToken),
                        getUserActiveWebtime(accessToken),
                        getUserTypingStatsByTime(accessToken),
                        getUserKeyStats(accessToken),
                        getUserFingerStats(accessToken),
                        getUserAttempts(accessToken),
                        getUserKeyTypeLatency(accessToken),
                    ]);


                    const responseJson = await Promise.all(
                        responses.map(async (response) => {
                            if (!response.ok) return null;
                            return response.json();
                        })
                    );

                    const data = responseJson.map((response) => (response ? response.data : null));

                    if (data[0] && data[1]) {
                        setGeneralStatData({
                            totalTime: data[1].total_time_failed + data[1].total_time_success,
                            bestWPM: data[0].bestWPM,
                            avgWPM: data[0].avgWPM,
                            bestCPM: data[0].bestCPM,
                            avgCPM: data[0].avgCPM,
                            avgAccuracy: data[0].avgAccuracy
                        });
                    }

                    if (data[2]) {
                        const timeName: Record<string, string> = {
                            current: "Hiện tại",
                            last_week: "Tuần trước",
                            last_month: "Tháng trước",
                        };
                        const dataToSet = Object.entries(data[2]).map(([key, value]: [string, any]) => ({
                            name: timeName[key] || "unknown",
                            value: Math.round(value.avgWPM),
                            postText: " wpm",
                        }));
                        setTypingSpeedByTimeData(dataToSet);
                    }

                    if (data[3]) {
                        console.log("Key Stats:", data[3]);
                        setKeyStatsData(data[3]);
                    }

                    if (data[4]) {
                        setFingerStatsData(data[4]);
                    }

                    if (data[5]) {
                        setSessionAttemptsData(data[5]);
                    }

                    if (data[6]) {
                        console.log("Key Type Latency:", data[6]);
                        const keyTypeName: Record<string, string> = {
                            lowercase: "Chữ thường",
                            uppercase: "Chữ hoa",
                            space: "Dấu cách",
                            number: "Số",
                            symbol: "Ký tự đặc biệt",
                        };
                        const dataToSet = Object.entries(data[6]).map(([key, value]: [string, any]) => ({
                            name: keyTypeName[key] || "unknown",
                            value: Math.round(value.avgLatency),
                            postText: "ms",
                        }));
                        setTypingLatencyByKeyTypeData(dataToSet);
                    }
                    setStatsLoading(false);
                } catch (error) {
                    toast.error("Đã có lỗi xảy ra khi tải dữ liệu thống kê. Vui lòng thử lại.");
                }
            }
            fetchStats();
        }
    }, [loading, isGuest, authChecked]);

    // const donutsData = [
    //     {
    //         goalText: "15 phút",
    //         goalValue: 15,
    //         progressText: "9 phút",
    //         progressValue: 9,
    //         extraText: "Hôm nay"
    //     },
    //     {
    //         goalText: "30 phút",
    //         goalValue: 30,
    //         progressText: "20 phút",
    //         progressValue: 20,
    //         extraText: "Tuần này"
    //     },
    //     {
    //         goalText: "45 phút",
    //         goalValue: 45,
    //         progressText: "30 phút",
    //         progressValue: 30,
    //         extraText: "Tuần trước"
    //     },
    //     {
    //         goalText: "60 phút",
    //         goalValue: 60,
    //         progressText: "45 phút",
    //         progressValue: 45,
    //         extraText: "Tháng này"
    //     },
    //     {
    //         goalText: "120 phút",
    //         goalValue: 120,
    //         progressText: "90 phút",
    //         progressValue: 90,
    //         extraText: "Tháng trước"
    //     }
    // ]

    // const activeWebtimeData = {
    //     day: {
    //         value: [
    //             { name: 'Thành công', value: 1000 },
    //             { name: 'Thất bại', value: 20 },
    //         ],
    //     },
    //     week: {
    //         value: [
    //             { name: 'Thành công', value: 5000 },
    //             { name: 'Thất bại', value: 100 },
    //         ],
    //     },
    //     month: {
    //         value: [
    //             { name: 'Thành công', value: 20000 },
    //             { name: 'Thất bại', value: 500 },
    //         ],
    //     }
    // };

    if (loading || statsLoading) {
        return (
            <div className="h-full w-full flex justify-center items-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (isGuest) {
        return null
    }

    return (
        <div className="p-4 flex flex-col gap-5 max-w-5xl mx-auto">
            <GeneralStat chartData={generalStatData} />
            <SessionAttempts sessionAttempts={sessionAttemptsData} />
            <CustomHorizontalBarChart chartName="Tốc độ gõ theo thời gian" chartData={typingSpeedByTimeData} />
            <CustomHorizontalBarChart chartName="Tốc độ gõ theo từng loại ký tự" chartData={typingLatencyByKeyTypeData} />
            <KeyboardChart keysData={keyStatsData} />
            {/* <CustomDonutChart chartName="Tiến độ mục tiêu" chartData={activeWebtimeData} />
            <ActiveWebtimePieChart chartData={activeWebtimeData} /> */}
            <HandsChart fingersData={fingerStatsData} />
        </div>
    )
};

export default StatisticsPage;