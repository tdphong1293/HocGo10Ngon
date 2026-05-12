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
import type { FingerId, FingerStat } from "@/components/Hands";
import SessionAttempts from "./SessionAttempts";
import { formatTimeTextCompact } from '@/lib/timeFormat';

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
    const [typingSpeedByTimeData, setTypingSpeedByTimeData] = useState<{
        name: string;
        value: number;
        postText: string;
    }[] | null>(null);
    const [typingLatencyByKeyTypeData, setTypingLatencyByKeyTypeData] = useState<{
        name: string;
        value: number;
        postText: string;
    }[] | null>(null);
    const [activeWebtimeData, setActiveWebtimeData] = useState<
        Record<"today" | "this_week" | "overall", { name: string; value: number }[]> | null
    >(null);
    const [keyStatsData, setKeyStatsData] = useState<
        Record<string, { accuracy: number; avgLatency: number; }> | null
    >(null);
    const [fingerStatsData, setFingerStatsData] = useState<
        Partial<Record<FingerId, FingerStat>> | null
    >(null);
    const [sessionAttemptsData, setSessionAttemptsData] = useState<{
        today: number[];
        this_week: number[];
    } | null>(null);
    const [goalDonutData, setGoalDonutData] = useState<
        {
            goalText: string;
            goalValue: number;
            progressText: string;
            progressValue: number;
            extraText?: string;
        }[] | null
    >(null);

    useEffect(() => {
        const checkAuth = async () => {
            const result = await requireAuth();
            setAuthChecked(result);
        };
        checkAuth();
    }, []);

    useEffect(() => {
        if (authChecked && !isGuest) {
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
                            totalTime: data[1].total_failed + data[1].total_success,
                            bestWPM: data[0].bestWPM,
                            avgWPM: data[0].avgWPM,
                            bestCPM: data[0].bestCPM,
                            avgCPM: data[0].avgCPM,
                            avgAccuracy: data[0].avgAccuracy
                        });
                    }

                    if (data[1]) {
                        setActiveWebtimeData({
                            today: [
                                {
                                    name: "Thành công",
                                    value: data[1].today_success
                                },
                                {
                                    name: "Thất bại",
                                    value: data[1].today_failed
                                }
                            ],
                            this_week: [
                                {
                                    name: "Thành công",
                                    value: data[1].this_week_success
                                },
                                {
                                    name: "Thất bại",
                                    value: data[1].this_week_failed
                                }
                            ],
                            overall: [
                                {
                                    name: "Thành công",
                                    value: data[1].total_success
                                },
                                {
                                    name: "Thất bại",
                                    value: data[1].total_failed
                                }
                            ]
                        });

                        setGoalDonutData([
                            {
                                goalText: "15 phút",
                                goalValue: 900,
                                progressText: formatTimeTextCompact(data[1].today_success),
                                progressValue: data[1].today_success,
                                extraText: "Hôm nay"
                            },
                            {
                                goalText: "1 giờ",
                                goalValue: 3600,
                                progressText: formatTimeTextCompact(data[1].this_week_success),
                                progressValue: data[1].this_week_success,
                                extraText: "Tuần này"
                            },
                            {
                                goalText: "1 giờ",
                                goalValue: 3600,
                                progressText: formatTimeTextCompact(data[1].last_week_success),
                                progressValue: data[1].last_week_success,
                                extraText: "Tuần trước"
                            },

                        ]);
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
                        setKeyStatsData(data[3]);
                    }

                    if (data[4]) {
                        setFingerStatsData(data[4]);
                    }

                    if (data[5]) {
                        setSessionAttemptsData(data[5]);
                    }

                    if (data[6]) {
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
    }, [isGuest, authChecked]);

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
            <CustomDonutChart chartName="Tiến độ mục tiêu" chartData={goalDonutData} />
            <ActiveWebtimePieChart chartData={activeWebtimeData} />
            <HandsChart fingersData={fingerStatsData} />
        </div>
    )
};

export default StatisticsPage;