import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session, SessionDocument } from '../mongoose/schemas/session.schema';

type Finger =
    | 'left_pinky'
    | 'left_ring'
    | 'left_middle'
    | 'left_index'
    | 'right_index'
    | 'right_middle'
    | 'right_ring'
    | 'right_pinky'
    | 'thumb'
    | 'unknown';

type KeyType = 'lowercase' | 'uppercase' | 'number' | 'symbol' | 'space';

@Injectable()
export class StatService {
    constructor(
        @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    ) { }

    async getUserActiveWebtime(userid: string) {
        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        const startOfWeek = new Date(now);
        const day = startOfWeek.getDay();
        const diff = (day === 0 ? 6 : day - 1);
        startOfWeek.setDate(startOfWeek.getDate() - diff);
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const timeData = await this.sessionModel.aggregate([
            {
                $match: { userid }
            },
            {
                $group: {
                    _id: null,

                    today_time_success: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $gte: ["$createdAt", startOfDay] },
                                        { $lte: ["$createdAt", endOfDay] },
                                        { $gte: ["$accuracy", 80] },
                                        { $gte: ["$WPM", 20] },
                                        { $gte: ["$CPM", 100] }
                                    ]
                                },
                                "$duration",
                                0
                            ]
                        }
                    },

                    today_time_failed: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $gte: ["$createdAt", startOfDay] },
                                        { $lte: ["$createdAt", endOfDay] },
                                        {
                                            $or: [
                                                { $lt: ["$accuracy", 80] },
                                                { $lt: ["$WPM", 20] },
                                                { $lt: ["$CPM", 100] }
                                            ]
                                        }
                                    ]
                                },
                                "$duration",
                                0
                            ]
                        }
                    },

                    this_week_time_success: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $gte: ["$createdAt", startOfWeek] },
                                        { $lte: ["$createdAt", endOfWeek] },
                                        { $gte: ["$accuracy", 80] },
                                        { $gte: ["$WPM", 20] },
                                        { $gte: ["$CPM", 100] }
                                    ]
                                },
                                "$duration",
                                0
                            ]
                        }
                    },

                    this_week_time_failed: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $gte: ["$createdAt", startOfWeek] },
                                        { $lte: ["$createdAt", endOfWeek] },
                                        {
                                            $or: [
                                                { $lt: ["$accuracy", 80] },
                                                { $lt: ["$WPM", 20] },
                                                { $lt: ["$CPM", 100] }
                                            ]
                                        }
                                    ]
                                },
                                "$duration",
                                0
                            ]
                        }
                    },

                    total_time_success: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $gte: ["$accuracy", 80] },
                                        { $gte: ["$WPM", 20] },
                                        { $gte: ["$CPM", 100] }
                                    ]
                                },
                                "$duration",
                                0
                            ]
                        }
                    },

                    total_time_failed: {
                        $sum: {
                            $cond: [
                                {
                                    $or: [
                                        { $lt: ["$accuracy", 80] },
                                        { $lt: ["$WPM", 20] },
                                        { $lt: ["$CPM", 100] }
                                    ]
                                },
                                "$duration",
                                0
                            ]
                        }
                    },
                }
            }
        ]);
        return timeData[0] || { today_time_success: 0, today_time_failed: 0, this_week_time_success: 0, this_week_time_failed: 0, total_time_success: 0, total_time_failed: 0 };
    }

    async getUserTypingStats(userid: string) {
        const stats = await this.sessionModel.aggregate([
            {
                $match: {
                    userid,
                    accuracy: { $gte: 80 },
                    WPM: { $gte: 20 },
                    CPM: { $gte: 100 }
                }
            },
            {
                $group: {
                    _id: null,
                    avgCPM: { $avg: "$CPM" },
                    bestCPM: { $max: "$CPM" },
                    avgWPM: { $avg: "$WPM" },
                    bestWPM: { $max: "$WPM" },
                    avgAccuracy: { $avg: "$accuracy" },
                }
            }
        ]);
        return stats[0] || { avgCPM: 0, bestCPM: 0, avgWPM: 0, bestWPM: 0, avgAccuracy: 0 };
    }

    async getUserTypingStatsByTime(userid: string) {
        const now = new Date();

        const thisWeekStart = new Date(now);
        const day = thisWeekStart.getDay();
        const diff = (day === 0 ? 6 : day - 1);
        thisWeekStart.setDate(thisWeekStart.getDate() - diff);
        thisWeekStart.setHours(0, 0, 0, 0);

        const lastWeekStart = new Date(thisWeekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);
        const lastWeekEnd = new Date(thisWeekStart);
        lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
        lastWeekEnd.setHours(23, 59, 59, 999);

        const lastMonthStart = new Date(now);
        lastMonthStart.setDate(1);
        lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
        lastMonthStart.setHours(0, 0, 0, 0);
        const lastMonthEnd = new Date(now);
        lastMonthEnd.setDate(0);
        lastMonthEnd.setHours(23, 59, 59, 999);

        const stats = await this.sessionModel.aggregate([
            {
                $match: {
                    userid,
                    accuracy: { $gte: 80 },
                    WPM: { $gte: 20 },
                    CPM: { $gte: 100 },
                },
            },
            {
                $facet: {
                    current: [
                        {
                            $group: {
                                _id: null,
                                avgCPM: { $avg: "$CPM" },
                                avgWPM: { $avg: "$WPM" },
                            }
                        }
                    ],
                    last_week: [
                        {
                            $match: {
                                createdAt: { $gte: lastWeekStart, $lte: lastWeekEnd },
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                avgCPM: { $avg: "$CPM" },
                                avgWPM: { $avg: "$WPM" },
                            }
                        }
                    ],
                    last_month: [
                        {
                            $match: {
                                createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                avgCPM: { $avg: "$CPM" },
                                avgWPM: { $avg: "$WPM" },
                            }
                        }
                    ]
                }
            }
        ]);

        const result = stats[0] || { current: [], last_week: [], last_month: [] };
        return {
            current: result.current[0] || { avgCPM: 0, avgWPM: 0 },
            last_week: result.last_week[0] || { avgCPM: 0, avgWPM: 0 },
            last_month: result.last_month[0] || { avgCPM: 0, avgWPM: 0 },
        };
    }

    async getUserKeyAccuracy(userid: string) {
        const keyStats = await this.sessionModel.aggregate([
            {
                $match: {
                    userid,
                    accuracy: { $gte: 80 },
                    WPM: { $gte: 20 },
                    CPM: { $gte: 100 }
                }
            },
            {
                $unwind: "$keystrokes"
            },
            {
                $group: {
                    _id: "$keystrokes.key",
                    total: { $sum: 1 },
                    correct:
                    {
                        $sum: {
                            $cond: ["$keystrokes.isCorrect", 1, 0]
                        }
                    }
                },
            },
            {
                $project: {
                    _id: 0,
                    key: "$_id",
                    total: 1,
                    correct: 1,
                    accuracy: {
                        $cond: [
                            { $eq: ["$total", 0] },
                            0,
                            { $multiply: [{ $divide: ["$correct", "$total"] }, 100] }
                        ]
                    }
                }
            }
        ]);

        return keyStats;
    }


    fingerMap: Record<string, Finger> = {
        'q': 'left_pinky', 'a': 'left_pinky', 'z': 'left_pinky', '\`': 'left_pinky', '~': 'left_pinky', '1': 'left_pinky', '!': 'left_pinky', '\t': 'left_pinky',
        'w': 'left_ring', 's': 'left_ring', 'x': 'left_ring', '2': 'left_ring', '@': 'left_ring',
        'e': 'left_middle', 'd': 'left_middle', 'c': 'left_middle', '3': 'left_middle', '#': 'left_middle',
        'r': 'left_index', 'f': 'left_index', 'v': 'left_index', 't': 'left_index', 'g': 'left_index', 'b': 'left_index', '4': 'left_index', '$': 'left_index', '5': 'left_index', '%': 'left_index',
        'y': 'right_index', 'h': 'right_index', 'n': 'right_index', 'u': 'right_index', 'j': 'right_index', 'm': 'right_index', '6': 'right_index', '^': 'right_index', '7': 'right_index', '&': 'right_index',
        'i': 'right_middle', 'k': 'right_middle', ',': 'right_middle', '8': 'right_middle', '*': 'right_middle',
        'o': 'right_ring', 'l': 'right_ring', '.': 'right_ring', '9': 'right_ring', '(': 'right_ring',
        'p': 'right_pinky', ';': 'right_pinky', ':': 'right_pinky', '/': 'right_pinky', '?': 'right_pinky', '\'': 'right_pinky', '"': 'right_pinky', '0': 'right_pinky', ')': 'right_pinky', '-': 'right_pinky', '_': 'right_pinky', '{': 'right_pinky', '}': 'right_pinky', '|': 'right_pinky', '\\': 'right_pinky', '[': 'right_pinky', ']': 'right_pinky', '+': 'right_pinky', '=': 'right_pinky', '\n': 'right_pinky',
        ' ': 'thumb'
    };

    getFingerByKey(key: string): Finger {
        if (key.length !== 1 && key !== '\t' && key !== '\n') {
            return 'unknown';
        }

        return this.fingerMap[key.toLowerCase()] || 'unknown';
    }

    async getUserFingerAccuracy(userid: string) {
        const keyStats = await this.getUserKeyAccuracy(userid);

        const fingerStats: Record<Finger, { total: number, correct: number, accuracy: number }> = {
            left_pinky: { total: 0, correct: 0, accuracy: 0 },
            left_ring: { total: 0, correct: 0, accuracy: 0 },
            left_middle: { total: 0, correct: 0, accuracy: 0 },
            left_index: { total: 0, correct: 0, accuracy: 0 },
            right_index: { total: 0, correct: 0, accuracy: 0 },
            right_middle: { total: 0, correct: 0, accuracy: 0 },
            right_ring: { total: 0, correct: 0, accuracy: 0 },
            right_pinky: { total: 0, correct: 0, accuracy: 0 },
            thumb: { total: 0, correct: 0, accuracy: 0 },
            // Xử lý trường hợp key không có trong fingerMap, gán vào nhóm 'unknown'
            unknown: { total: 0, correct: 0, accuracy: 0 }
        };

        for (const { key, total, correct } of keyStats) {
            const finger = this.getFingerByKey(key);
            fingerStats[finger].total += total;
            fingerStats[finger].correct += correct;
        }

        for (const stats of Object.values(fingerStats)) {
            stats.accuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
        }

        return fingerStats;
    }

    async getUserKeyLatency(userid: string) {
        const keyLatencyStats = await this.sessionModel.aggregate([
            {
                $match: {
                    userid,
                    accuracy: { $gte: 80 },
                    WPM: { $gte: 20 },
                    CPM: { $gte: 100 }
                },
            },
            {
                $unwind: "$keystrokes",
            },
            {
                $match: {
                    "keystrokes.deltaTime": { $ne: null }
                }
            },
            {
                $group: {
                    _id: "$keystrokes.key",
                    total: { $sum: 1 },
                    totalDeltaTime: { $sum: "$keystrokes.deltaTime" }
                },
            },
            {
                $project: {
                    _id: 0,
                    key: "$_id",
                    total: 1,
                    totalDeltaTime: 1,
                    avgLatency: {
                        $cond: [
                            { $eq: ["$total", 0] },
                            0,
                            { $divide: ["$totalDeltaTime", "$total"] }
                        ]
                    }
                }
            }
        ]);

        return keyLatencyStats;
    }

    async getUserFingerLatency(userid: string) {
        const keyLatencyStats = await this.getUserKeyLatency(userid);
        const fingerLatencyStats: Record<Finger, { total: number, totalDeltaTime: number, avgLatency: number }> = {
            left_pinky: { total: 0, totalDeltaTime: 0, avgLatency: 0 },
            left_ring: { total: 0, totalDeltaTime: 0, avgLatency: 0 },
            left_middle: { total: 0, totalDeltaTime: 0, avgLatency: 0 },
            left_index: { total: 0, totalDeltaTime: 0, avgLatency: 0 },
            right_index: { total: 0, totalDeltaTime: 0, avgLatency: 0 },
            right_middle: { total: 0, totalDeltaTime: 0, avgLatency: 0 },
            right_ring: { total: 0, totalDeltaTime: 0, avgLatency: 0 },
            right_pinky: { total: 0, totalDeltaTime: 0, avgLatency: 0 },
            thumb: { total: 0, totalDeltaTime: 0, avgLatency: 0 },
            // Xử lý trường hợp key không có trong fingerMap, gán vào nhóm 'unknown'
            unknown: { total: 0, totalDeltaTime: 0, avgLatency: 0 }
        };

        for (const { key, total, totalDeltaTime } of keyLatencyStats) {
            const finger = this.getFingerByKey(key);
            fingerLatencyStats[finger].total += total;
            fingerLatencyStats[finger].totalDeltaTime += totalDeltaTime;
        }

        for (const stats of Object.values(fingerLatencyStats)) {
            stats.avgLatency = stats.total > 0 ? stats.totalDeltaTime / stats.total : 0;
        }

        return fingerLatencyStats;
    }

    getKeyType(key: string): KeyType {
        if (/^[a-z]$/.test(key)) return 'lowercase';
        if (/^[A-Z]$/.test(key)) return 'uppercase';
        if (/^[0-9]$/.test(key)) return 'number';
        if (key === ' ') return 'space';
        return 'symbol';
    }

    async getUserKeyTypeLatency(userid: string) {
        const keyLatencyStats = await this.getUserKeyLatency(userid);
        const keyTypeLatencyStats: Record<KeyType, { total: number, totalDeltaTime: number, avgLatency: number }> = {
            lowercase: { total: 0, totalDeltaTime: 0, avgLatency: 0 },
            uppercase: { total: 0, totalDeltaTime: 0, avgLatency: 0 },
            number: { total: 0, totalDeltaTime: 0, avgLatency: 0 },
            symbol: { total: 0, totalDeltaTime: 0, avgLatency: 0 },
            space: { total: 0, totalDeltaTime: 0, avgLatency: 0 },
        };

        for (const { key, total, totalDeltaTime } of keyLatencyStats) {
            const keyType = this.getKeyType(key);
            keyTypeLatencyStats[keyType].total += total;
            keyTypeLatencyStats[keyType].totalDeltaTime += totalDeltaTime;
        }

        for (const stats of Object.values(keyTypeLatencyStats)) {
            stats.avgLatency = stats.total > 0 ? stats.totalDeltaTime / stats.total : 0;
        }

        return keyTypeLatencyStats;
    }

    async getUserTodaySessionAttempts(userid: string) {
        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);

        const sessionAttempts = await this.sessionModel.aggregate([
            {
                $match: {
                    userid,
                    createdAt: { $gte: startOfDay, $lte: endOfDay },
                },
            },
            {
                $project: {
                    _id: 0,
                    createdAt: 1,
                    isSuccess: {
                        $cond: [
                            {
                                $and: [
                                    { $gte: ["$accuracy", 80] },
                                    { $gte: ["$WPM", 20] },
                                    { $gte: ["$CPM", 100] }
                                ]
                            },
                            1,
                            0
                        ]
                    },
                },
            },
            {
                $sort: { createdAt: 1 },
            },
        ]);

        return sessionAttempts.map((attempt) => attempt.isSuccess);
    }

    async getUserThisWeekSessionAttempts(userid: string) {
        const now = new Date();
        const startOfWeek = new Date(now);
        const day = startOfWeek.getDay();
        const diff = (day === 0 ? 6 : day - 1);
        startOfWeek.setDate(startOfWeek.getDate() - diff);
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const sessionAttempts = await this.sessionModel.aggregate([
            {
                $match: {
                    userid,
                    createdAt: { $gte: startOfWeek, $lte: endOfWeek },
                },
            },
            {
                $project: {
                    _id: 0,
                    createdAt: 1,
                    isSuccess: {
                        $cond: [
                            {
                                $and: [
                                    { $gte: ["$accuracy", 80] },
                                    { $gte: ["$WPM", 20] },
                                    { $gte: ["$CPM", 100] }
                                ]
                            },
                            1,
                            0
                        ]
                    },
                },
            },
            {
                $sort: { createdAt: 1 },
            },
        ]);

        return sessionAttempts.map((attempt) => attempt.isSuccess);
    }

}