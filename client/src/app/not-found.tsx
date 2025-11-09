// app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
            <h1 className="text-9xl font-bold mb-4">404</h1>
            <p className="text-4xl mb-4">Trang bạn đang tìm không tồn tại.</p>
            <Link
                href="/"
                className="text-primary hover:underline text-2xl"
            >
                Quay lại trang chủ
            </Link>
        </div>
    );
}
