const Footer = () => {
    return (
        <footer className="border-t border-border bg-card/40">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-3 pb-4 pt-5 sm:px-5 lg:px-6">
                <div className="grid gap-3 md:grid-cols-[1.2fr_1fr_1fr]">
                    <div className="space-y-1">
                        <div className="text-base font-semibold text-foreground">HocGo10Ngon</div>
                        <p className="text-xs text-muted-foreground">
                            Luyện gõ 10 ngón rõ ràng, tinh gọn và dễ theo dõi.
                        </p>
                    </div>

                    <div className="space-y-1 text-xs">
                        <div className="font-semibold text-foreground">Khám phá</div>
                        <ul className="space-y-1 text-muted-foreground">
                            <li>
                                <a className="transition-colors hover:text-foreground" href="/practice">Luyện tập</a>
                            </li>
                            <li>
                                <a className="transition-colors hover:text-foreground" href="/lessons">Bài học</a>
                            </li>
                            <li>
                                <a className="transition-colors hover:text-foreground" href="/statistics">Thống kê</a>
                            </li>
                            <li>
                                <a className="transition-colors hover:text-foreground" href="/about">Về chúng tôi</a>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-1 text-xs">
                        <div className="font-semibold text-foreground">Nguồn cảm hứng</div>
                        <ul className="space-y-1 text-muted-foreground">
                            <li>
                                <a
                                    className="transition-colors hover:text-foreground"
                                    href="https://monkeytype.com/"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Monkeytype
                                </a>
                            </li>
                            <li>
                                <a
                                    className="transition-colors hover:text-foreground"
                                    href="https://www.typingclub.com/"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    TypingClub
                                </a>
                            </li>
                        </ul>
                        <div className="pt-1 text-xs font-semibold text-foreground">Gợi ý luyện burst</div>
                        <a
                            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                            href="https://www.burst-type.pro/"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Burst Type
                        </a>
                    </div>
                </div>

                <div className="flex flex-col items-start justify-between gap-1 border-t border-border/70 pt-2 text-[11px] text-muted-foreground sm:flex-row sm:items-center">
                    <div>HocGo10Ngon - Học gõ 10 ngón hiệu quả.</div>
                    <div>Thiết kế tối giản, dễ tập trung.</div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;