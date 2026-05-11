import { useId, useState } from "react";

export type FingerId =
    | "left_pinky"
    | "left_ring"
    | "left_middle"
    | "left_index"
    | "right_index"
    | "right_middle"
    | "right_ring"
    | "right_pinky"
    | "thumb";

export type FingerStat = {
    accuracy: number;
    avgLatency: number;
};

interface HandProps {
    side?: "left" | "right";
    colors?: {
        palm?: string;
        thumb?: string;
        index?: string;
        middle?: string;
        ring?: string;
        pinky?: string;
    };
    stats?: Partial<Record<FingerId, FingerStat>>;
}

const Hands: React.FC<HandProps> = ({
    side = "left",
    colors = {},
    stats,
}) => {
    const {
        palm = "var(--primary-200)",
        index = "var(--primary-500)",
        middle = "var(--primary-500)",
        ring = "var(--primary-500)",
        pinky = "var(--primary-500)",
    } = colors;

    const clipPathId = useId();
    const [hoveredFinger, setHoveredFinger] = useState<FingerId | null>(null);
    const viewBoxX = 25;
    const viewBoxWidth = 376.35;
    const viewBoxHeight = 375.86;
    const mirror =
        side === "right"
            ? `translate(${viewBoxWidth + viewBoxX * 2} 0) scale(-1 1)`
            : undefined;

    const fingerLabels: Record<FingerId, string> = {
        left_pinky: "Ngón út trái",
        left_ring: "Ngón áp út trái",
        left_middle: "Ngón giữa trái",
        left_index: "Ngón trỏ trái",
        right_index: "Ngón trỏ phải",
        right_middle: "Ngón giữa phải",
        right_ring: "Ngón áp út phải",
        right_pinky: "Ngón út phải",
        thumb: "Ngón cái",
    };

    const currentStat = hoveredFinger ? stats?.[hoveredFinger] : undefined;
    const accuracyValue = currentStat
        ? (currentStat.accuracy).toFixed(2)
        : undefined;
    const latencyValue = currentStat
        ? Math.round(currentStat.avgLatency)
        : undefined;

    const getFingerStyle = (fingerId: FingerId) => ({
        cursor: "pointer",
        transition: "opacity 120ms ease",
        opacity:
            hoveredFinger && hoveredFinger !== fingerId
                ? 0
                : 1,
    });

    return (
        <div className="flex flex-col gap-1 items-center">
            <svg
                width="220"
                height="220"
                viewBox={`${viewBoxX} 0 ${viewBoxWidth} ${viewBoxHeight}`}
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-label={`${side} hand`}
                onMouseLeave={() => setHoveredFinger(null)}
            >
                <title>{side === "right" ? "right-hand" : "left-hand"}</title>
                <defs>
                    <clipPath id={clipPathId}>
                        <path
                            d="M201.85,330.65c7.93,16.47-6.27,91.56,57.07,126.05s128.56-5,152.39-44.53,43.89-44.44,67.1-72.75c25.61-31.23-14.86-41.83-36.81-23s-50.36,56.25-59.77,15.49,18.19-101,28.22-126.05,10.42-44-1-48.74c-13.6-5.62-24.74,3-35.4,28.67s-36.59,105.7-42.24,83.12-1-94.2-1.66-114.49c-.71-23-30.1-32.62-35.75,0s-5,106.76-6.9,117.91c-1.82,10.68-7.09,6.57-10.66,1.25-9.91-14.74-26.84-85.56-32.61-99.08-8-18.78-38.79-17.4-33.86,14.42,5,32.6,33.23,101.38,24.46,112-10.77,13-41.86-89-67.1-75C147.58,237,193.7,313.72,201.85,330.65Z"
                            transform="translate(-110.28 -94.05)"
                        />
                    </clipPath>
                </defs>
                <g transform={mirror}>
                    <path
                        d="M201.85,330.65c7.93,16.47-6.27,91.56,57.07,126.05s128.56-5,152.39-44.53,43.89-44.44,67.1-72.75c25.61-31.23-14.86-41.83-36.81-23s-50.36,56.25-59.77,15.49,18.19-101,28.22-126.05,10.42-44-1-48.74c-13.6-5.62-24.74,3-35.4,28.67s-36.59,105.7-42.24,83.12-1-94.2-1.66-114.49c-.71-23-30.1-32.62-35.75,0s-5,106.76-6.9,117.91c-1.82,10.68-7.09,6.57-10.66,1.25-9.91-14.74-26.84-85.56-32.61-99.08-8-18.78-38.79-17.4-33.86,14.42,5,32.6,33.23,101.38,24.46,112-10.77,13-41.86-89-67.1-75C147.58,237,193.7,313.72,201.85,330.65Z"
                        transform="translate(-110.28 -94.05)"
                        fill={palm}
                    />
                    <g clipPath={`url(#${clipPathId})`}>
                        <path
                            d="M207.89,367.31a101.25,101.25,0,0,0,.58,10.93L179.59,388,110.28,183,183.2,158.3l48.45,143.35A102.16,102.16,0,0,0,207.89,367.31Z"
                            transform="translate(-110.28 -94.05)"
                            fill={pinky}
                            onMouseEnter={() =>
                                setHoveredFinger(
                                    side === "left"
                                        ? "left_pinky"
                                        : "right_pinky"
                                )
                            }
                            style={getFingerStyle(
                                side === "left"
                                    ? "left_pinky"
                                    : "right_pinky"
                            )}
                        />
                        <path
                            d="M280.2,269.24a102.72,102.72,0,0,0-46.9,30.46L175.89,129.86l51.33-17.35Z"
                            transform="translate(-110.28 -94.05)"
                            fill={ring}
                            onMouseEnter={() =>
                                setHoveredFinger(
                                    side === "left"
                                        ? "left_ring"
                                        : "right_ring"
                                )
                            }
                            style={getFingerStyle(
                                side === "left"
                                    ? "left_ring"
                                    : "right_ring"
                            )}
                        />
                        <path
                            d="M336.61,94v174a103.11,103.11,0,0,0-55.27.85V94Z"
                            transform="translate(-110.28 -94.05)"
                            fill={middle}
                            onMouseEnter={() =>
                                setHoveredFinger(
                                    side === "left"
                                        ? "left_middle"
                                        : "right_middle"
                                )
                            }
                            style={getFingerStyle(
                                side === "left"
                                    ? "left_middle"
                                    : "right_middle"
                            )}
                        />
                        <path
                            d="M441.37,119.21V307.12H393.59a102.7,102.7,0,0,0-57.83-39.28V119.21Z"
                            transform="translate(-110.28 -94.05)"
                            fill={index}
                            onMouseEnter={() =>
                                setHoveredFinger(
                                    side === "left"
                                        ? "left_index"
                                        : "right_index"
                                )
                            }
                            style={getFingerStyle(
                                side === "left"
                                    ? "left_index"
                                    : "right_index"
                            )}
                        />
                    </g>
                </g>
            </svg>
            <div className="w-full text-sm">
                <div
                    className="flex min-h-10 min-w-65 items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm"
                >
                    <span
                        className={
                            hoveredFinger
                                ? "font-medium text-slate-700"
                                : "text-slate-400"
                        }
                    >
                        {hoveredFinger
                            ? fingerLabels[hoveredFinger]
                            : "Trỏ vào ngón tay"}
                    </span>
                    <div
                        className={
                            hoveredFinger
                                ? "flex items-center gap-4 text-slate-600"
                                : "flex items-center gap-4 text-slate-300"
                        }
                    >
                        <span>
                            {hoveredFinger ? latencyValue ?? "--" : "--"}
                            ms
                        </span>
                        <span>
                            {hoveredFinger ? accuracyValue ?? "--" : "--"}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Hands;