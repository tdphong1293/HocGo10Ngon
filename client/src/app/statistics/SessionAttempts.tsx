interface SessionAttemptsProps {
    sessionAttempts: {
        today: number[];
        thisWeek: number[];
    }
}

const SessionAttempts: React.FC<SessionAttemptsProps> = ({ 
    sessionAttempts,
}) => {
    const todayMaxAttempts = 30;
    const thisWeekMaxAttempts = 120;

    if (!sessionAttempts) {
        return (
            <div className="flex bg-card border-2 border-border p-5 items-center justify-center">
                <span className="text-xl">
                    Bạn chưa có dữ liệu thống kê nào cho số lần luyện tập
                </span>
            </div> 
        );
    }

    return (
        <div className="flex flex-col gap-2 bg-card border-2 border-border p-4">
            <div className="text-2xl">
                Số lần luyện tập
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border text-card-foreground">
                <div className="bg-card text-center p-2 flex flex-col justify-center items-center gap-1">
                    <span className="text-sm">Hôm nay</span>
                    <div className="grid grid-cols-10 gap-1 w-fit">
                        {Array.from({ length: todayMaxAttempts }, (_, index) => (
                            <div
                                key={"today_attempt_" + index}
                                className={`h-4 w-4 ${index < sessionAttempts.today.length ? sessionAttempts.today[index] ? "bg-primary" : "bg-destructive" : "bg-primary-200"}`}
                            />
                        ))}
                    </div>
                    <div className="text-sm font-bold mt-2">
                        {sessionAttempts.today.length} lần luyện tập
                    </div>
                </div>
                <div className="bg-card text-center p-2 flex flex-col justify-center items-center gap-1">
                    <span className="text-sm">Tuần này</span>
                    <div className="grid grid-cols-20 gap-1 w-fit">
                        {Array.from({ length: thisWeekMaxAttempts }, (_, index) => (
                            <div
                                key={"thisWeek_attempt_" + index}
                                className={`h-4 w-4 ${index < sessionAttempts.thisWeek.length ? sessionAttempts.thisWeek[index] ? "bg-primary" : "bg-destructive" : "bg-primary-200"}`}
                            />
                        ))}
                    </div>
                    <div className="text-sm font-bold mt-2">
                        {sessionAttempts.thisWeek.length} lần luyện tập
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SessionAttempts;