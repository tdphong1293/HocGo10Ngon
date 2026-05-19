'use client';

export default function AboutPage() {
    return (
        <div className="relative overflow-hidden bg-background">
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>
            </div>

            <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 pb-20 pt-16 sm:px-10 lg:px-12">
                <header className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                        Giới thiệu
                    </p>
                    <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">Về HocGo10Ngon</h1>
                    <p className="text-base text-muted-foreground">
                        Trang luyện gõ 10 ngón được xây dựng để học đúng kỹ thuật, luyện đều
                        tay và giữ trải nghiệm gọn gàng, dễ tập trung.
                    </p>
                </header>

                <section className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-card/60 p-5">
                        <div className="text-sm font-semibold text-foreground">Tác giả</div>
                        <p className="mt-2 text-sm text-muted-foreground">tdphong1293</p>
                        <a
                            className="mt-3 inline-flex text-sm font-semibold text-foreground transition hover:text-primary"
                            href="https://github.com/tdphong1293"
                            target="_blank"
                            rel="noreferrer"
                        >
                            GitHub: github.com/tdphong1293
                        </a>
                    </div>
                    <div className="rounded-2xl border border-border bg-card/60 p-5">
                        <div className="text-sm font-semibold text-foreground">Nguồn cảm hứng</div>
                        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                            <li>
                                <a
                                    className="transition hover:text-foreground"
                                    href="https://monkeytype.com/"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Monkeytype
                                </a>
                            </li>
                            <li>
                                <a
                                    className="transition hover:text-foreground"
                                    href="https://www.typingclub.com/"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    TypingClub
                                </a>
                            </li>
                        </ul>
                        <div className="mt-4 text-sm font-semibold text-foreground">Gợi ý luyện burst</div>
                        <a
                            className="mt-2 inline-flex text-sm text-muted-foreground transition hover:text-foreground"
                            href="https://www.burst-type.pro/"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Burst Type
                        </a>
                    </div>
                </section>
            </main>
        </div>
    );
}
