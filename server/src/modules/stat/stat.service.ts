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

        const startOfWeek = new Date(now);
        const day = startOfWeek.getDay();
        const diff = (day === 0 ? 6 : day - 1);
        startOfWeek.setDate(startOfWeek.getDate() - diff);
        startOfWeek.setHours(0, 0, 0, 0);

        const timeData = await this.sessionModel.aggregate([
            {
                $match: {
                    userid,
                    accuracy: { $gte: 0.8 },
                    wpm: { $gte: 20 },
                    cpm: { $gte: 100 }
                }
            },
            {
                $group: {
                    _id: null,

                    today_time: {
                        $sum: {
                            $cond: [
                                { $gte: ["$createdAt", startOfDay] },
                                "$duration",
                                0
                            ]
                        }
                    },

                    week_time: {
                        $sum: {
                            $cond: [
                                { $gte: ["$createdAt", startOfWeek] },
                                "$duration",
                                0
                            ]
                        }
                    },

                    total_time: {
                        $sum: "$duration"
                    }
                }
            }
        ]);
        return timeData[0] || { today_time: 0, week_time: 0, total_time: 0 };
    }

    async getUserTypingStats(userid: string) {
        const stats = await this.sessionModel.aggregate([
            {
                $match: {
                    userid,
                    accuracy: { $gte: 0.8 },
                    wpm: { $gte: 20 },
                    cpm: { $gte: 100 }
                }
            },
            {
                $group: {
                    _id: null,
                    bestCPM: { $max: "$CPM" },
                    averageCPM: { $avg: "$CPM" },
                    averageWPM: { $avg: "$WPM" },
                    bestWPM: { $max: "$WPM" },
                    averageAccuracy: { $avg: "$accuracy" },
                    totalSessions: { $sum: 1 }
                }
            }
        ]);
        return stats[0] || { bestCPM: 0, averageCPM: 0, averageWPM: 0, bestWPM: 0, averageAccuracy: 0, totalSessions: 0 };
    }

    async getUserKeyAccuracy(userid: string) {
        const keyStats = await this.sessionModel.aggregate([
            {
                $match: {
                    userid,
                    accuracy: { $gte: 0.8 },
                    wpm: { $gte: 20 },
                    cpm: { $gte: 100 }
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
                            { $divide: ["$correct", "$total"] }
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
            stats.accuracy = stats.total > 0 ? stats.correct / stats.total : 0;
        }

        return fingerStats;
    }

    async getUserKeyLatency(userid: string) {
        const keyLatencyStats = await this.sessionModel.aggregate([
            {
                $match: {
                    userid,
                    accuracy: { $gte: 0.8 },
                    wpm: { $gte: 20 },
                    cpm: { $gte: 100 }
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
                    totalTime: { $sum: "$keystrokes.deltaTime" }
                },
            },
            {
                $project: {
                    _id: 0,
                    key: "$_id",
                    total: 1,
                    totalTime: 1,
                    averageLatency: {
                        $cond: [
                            { $eq: ["$total", 0] },
                            0,
                            { $divide: ["$totalTime", "$total"] }
                        ]
                    }
                }
            }
        ]);

        return keyLatencyStats;
    }

    async getUserFingerLatency(userid: string) {
        const keyLatencyStats = await this.getUserKeyLatency(userid);
        const fingerLatencyStats: Record<Finger, { total: number, totalTime: number, averageLatency: number }> = {
            left_pinky: { total: 0, totalTime: 0, averageLatency: 0 },
            left_ring: { total: 0, totalTime: 0, averageLatency: 0 },
            left_middle: { total: 0, totalTime: 0, averageLatency: 0 },
            left_index: { total: 0, totalTime: 0, averageLatency: 0 },
            right_index: { total: 0, totalTime: 0, averageLatency: 0 },
            right_middle: { total: 0, totalTime: 0, averageLatency: 0 },
            right_ring: { total: 0, totalTime: 0, averageLatency: 0 },
            right_pinky: { total: 0, totalTime: 0, averageLatency: 0 },
            thumb: { total: 0, totalTime: 0, averageLatency: 0 },
            // Xử lý trường hợp key không có trong fingerMap, gán vào nhóm 'unknown'
            unknown: { total: 0, totalTime: 0, averageLatency: 0 }
        };

        for (const { key, total, totalTime } of keyLatencyStats) {
            const finger = this.getFingerByKey(key);
            fingerLatencyStats[finger].total += total;
            fingerLatencyStats[finger].totalTime += totalTime;
        }

        for (const stats of Object.values(fingerLatencyStats)) {
            stats.averageLatency = stats.total > 0 ? stats.totalTime / stats.total : 0;
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
        const keyTypeLatencyStats: Record<KeyType, { total: number, totalTime: number, averageLatency: number }> = {
            lowercase: { total: 0, totalTime: 0, averageLatency: 0 },
            uppercase: { total: 0, totalTime: 0, averageLatency: 0 },
            number: { total: 0, totalTime: 0, averageLatency: 0 },
            symbol: { total: 0, totalTime: 0, averageLatency: 0 },
            space: { total: 0, totalTime: 0, averageLatency: 0 },
        };

        for (const { key, total, totalTime } of keyLatencyStats) {
            const keyType = this.getKeyType(key);
            keyTypeLatencyStats[keyType].total += total;
            keyTypeLatencyStats[keyType].totalTime += totalTime;
        }

        for (const stats of Object.values(keyTypeLatencyStats)) {
            stats.averageLatency = stats.total > 0 ? stats.totalTime / stats.total : 0;
        }

        return keyTypeLatencyStats;
    }

    async getUserTodaySessionAttempts(userid: string) {
        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);

        const sessionCount = await this.sessionModel.aggregate([
            {
                $match: { userid },
            },
            {
                $group: {
                    _id: null,
                    success_attempts: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $gte: ["$createdAt", startOfDay] },
                                        { $lte: ["$createdAt", endOfDay] },
                                        { $gte: ["$accuracy", 0.8] },
                                        { $gte: ["$wpm", 20] },
                                        { $gte: ["$cpm", 100] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    failed_attempts: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $gte: ["$createdAt", startOfDay] },
                                        { $lte: ["$createdAt", endOfDay] },
                                        { $lt: ["$accuracy", 0.8] },
                                        { $lt: ["$wpm", 20] },
                                        { $lt: ["$cpm", 100] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    total_attempts: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $gte: ["$createdAt", startOfDay] },
                                        { $lte: ["$createdAt", endOfDay] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        return sessionCount[0] || { success_attempts: 0, failed_attempts: 0, total_attempts: 0 };
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

        const sessionCount = await this.sessionModel.aggregate([
            {
                $match: { userid },
            },
            {
                $group: {
                    _id: null,
                    success_attempts: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $gte: ["$createdAt", startOfWeek] },
                                        { $lte: ["$createdAt", endOfWeek] },
                                        { $gte: ["$accuracy", 0.8] },
                                        { $gte: ["$wpm", 20] },
                                        { $gte: ["$cpm", 100] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    failed_attempts: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $gte: ["$createdAt", startOfWeek] },
                                        { $lte: ["$createdAt", endOfWeek] },
                                        { $lt: ["$accuracy", 0.8] },
                                        { $lt: ["$wpm", 20] },
                                        { $lt: ["$cpm", 100] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    total_attempts: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $gte: ["$createdAt", startOfWeek] },
                                        { $lte: ["$createdAt", endOfWeek] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        return sessionCount[0] || { success_attempts: 0, failed_attempts: 0, total_attempts: 0 };
    }

}