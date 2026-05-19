'use client';

import { useTheme } from '@/hooks/useTheme';
import Link from 'next/link'

const Home = () => {
	const { theme, font } = useTheme();

	return (
		<div className="relative overflow-hidden bg-background">
			<div className="pointer-events-none absolute inset-0 -z-10">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent"></div>
				<div className="absolute -top-28 -right-32 h-72 w-72 rounded-full bg-accent/20 blur-3xl"></div>
				<div className="absolute top-1/3 -left-32 h-80 w-80 rounded-full bg-secondary/15 blur-3xl"></div>
				<div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl"></div>
			</div>

			<main className="relative mx-auto flex w-full max-w-6xl flex-col gap-20 px-6 pb-24 pt-16 sm:px-10 lg:px-12">
				<section className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
					<div className="space-y-6">
						<div className="inline-flex items-center gap-5 rounded-full border border-border bg-card/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
							<span>Tập trung  </span>
							<span>Đều nhịp  </span>
							<span>Chính xác</span>
						</div>
						<h1 className="flex flex-wrap items-baseline gap-x-2 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
							<span>HocGo10Ngon</span>
							<span className="text-muted-foreground">Học gõ 10 ngón hiệu quả</span>
						</h1>
						<p className="text-lg text-muted-foreground">
							Luyện tập thông minh với bài học rõ ràng, phản hồi trực tiếp và
							giao diện ít sao nhãng. Xây dựng trí nhớ cơ bắp, sau đó tăng tốc độ.
						</p>
						<div className="flex flex-wrap items-center gap-4">
							<Link
								className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-110"
								href="/practice"
							>
								Bắt đầu luyện tập
							</Link>
						</div>
						<div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
							<span className="rounded-full bg-secondary px-3 py-1">
								Giao diện: <span className="font-semibold text-secondary-foreground capitalize">{theme}</span>
							</span>
							<span className="rounded-full bg-secondary px-3 py-1">
								Phông chữ: <span className="font-semibold text-secondary-foreground capitalize">{font}</span>
							</span>
						</div>
					</div>
				</section>

				<section className="grid gap-6 md:grid-cols-3">
					<div className="rounded-2xl border border-border bg-card/60 p-6">
						<div className="text-sm font-semibold text-foreground">Bài học theo lộ trình</div>
						<p className="mt-3 text-sm text-muted-foreground">
							Học phím mới theo từng bước, sau đó luyện bằng bài văn chỉ định
							hoặc chuỗi phím mẫu.
						</p>
					</div>
					<div className="rounded-2xl border border-border bg-card/60 p-6">
						<div className="text-sm font-semibold text-foreground">Luyện tập theo chế độ</div>
						<p className="mt-3 text-sm text-muted-foreground">
							Nhiều chế độ gõ theo từ, theo thời gian hoặc theo đoạn văn, phù hợp với mọi trình độ.
						</p>
					</div>
					<div className="rounded-2xl border border-border bg-card/60 p-6">
						<div className="text-sm font-semibold text-foreground">Tùy biến giao diện</div>
						<p className="mt-3 text-sm text-muted-foreground">
							Đổi theme và font nhanh chóng để giữ tập trung và giảm mỏi mắt.
						</p>
					</div>
				</section>

				<section className="space-y-5">
					<div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Cách hoạt động</div>
					<h2 className="text-3xl font-semibold text-foreground">Hai nhánh học tập bổ trợ lẫn nhau</h2>
					<p className="text-muted-foreground">
						Bài học giúp bạn nắm kỹ thuật gõ đúng ngón, còn luyện tập giúp
						củng cố kỹ năng bằng văn bản được chỉ định hoặc sinh tự động.
					</p>
					<div className="grid gap-4 md:grid-cols-3">
						<div className="rounded-2xl border border-border bg-card/60 p-4">
							<div className="text-sm font-semibold text-foreground">1. Học phím mới</div>
							<p className="mt-2 text-sm text-muted-foreground">
								Tập trung vào phím mới, tư thế tay và nhịp gõ chuẩn.
							</p>
						</div>
						<div className="rounded-2xl border border-border bg-card/60 p-4">
							<div className="text-sm font-semibold text-foreground">2. Luyện có chủ đích</div>
							<p className="mt-2 text-sm text-muted-foreground">
								Luyện tập theo bài học đã học để củng cố kỹ năng và xây dựng phản xạ gõ chính xác.
							</p>
						</div>
						<div className="rounded-2xl border border-border bg-card/60 p-4">
							<div className="text-sm font-semibold text-foreground">3. Luyện tập tự do</div>
							<p className="mt-2 text-sm text-muted-foreground">
								Chọn chế độ phù hợp để luyện theo mục tiêu cá nhân.
							</p>
						</div>
					</div>
				</section>

				<section className="space-y-8">
					<div className="flex flex-col gap-3">
						<div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Chế độ luyện tập</div>
						<h2 className="text-3xl font-semibold text-foreground">Bài học và luyện tập</h2>
					</div>
					<div className="grid gap-6 md:grid-cols-2">
						<div className="rounded-2xl border border-border bg-card/60 p-6">
							<div className="text-lg font-semibold text-foreground">Bài học</div>
							<p className="mt-3 text-sm text-muted-foreground">
								Học phím mới và luyện theo bài do người tạo chỉ định, từ chuỗi
								phím đến đoạn văn.
							</p>
						</div>
						<div className="rounded-2xl border border-border bg-card/60 p-6">
							<div className="text-lg font-semibold text-foreground">Luyện tập</div>
							<p className="mt-3 text-sm text-muted-foreground">
								Tùy chọn chế độ luyện theo từ, theo thời gian hoặc theo đoạn văn,
								phù hợp nhiều trình độ.
							</p>
						</div>
					</div>
				</section>

				<section className="rounded-3xl border border-border bg-card/70 p-8 text-center">
					<h2 className="text-3xl font-semibold text-foreground">Sẵn sàng bắt đầu luyện tập?</h2>
					<p className="mt-3 text-muted-foreground">Tự tin gõ 10 ngón với phản hồi rõ ràng và tập trung cao.</p>
					<div className="mt-6 flex flex-wrap items-center justify-center gap-4">
						<Link
							className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-110"
							href="/practice"
						>
							Bắt đầu bài luyện tập
						</Link>
					</div>
				</section>
			</main>
		</div>
	);
}

export default Home;