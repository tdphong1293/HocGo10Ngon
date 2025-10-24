import LoadingSpinner from "@/components/LoadingSpinner";

const LoadingPage = () => {
    return (
        <div className="flex items-center justify-center h-full bg-background/80">
            <LoadingSpinner />
        </div>
    );
};

export default LoadingPage;
