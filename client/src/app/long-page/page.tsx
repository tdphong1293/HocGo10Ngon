const LongPage = () => {
    return (
        <div className="p-8 space-y-8">
            <h1 className="text-4xl font-bold">Long Page Test</h1>

            {/* Generate lots of content */}
            {Array.from({ length: 50 }, (_, i) => (
                <div key={i} className="p-6 border rounded-lg">
                    <h2 className="text-2xl font-semibold mb-4">Section {i + 1}</h2>
                    <p className="text-muted-foreground mb-4">
                        This is section {i + 1} with a lot of content to demonstrate
                        how the layout handles long pages. The navbar stays fixed at the top
                        while this main content area becomes scrollable.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-secondary rounded">
                            Content block A in section {i + 1}
                        </div>
                        <div className="p-4 bg-secondary rounded">
                            Content block B in section {i + 1}
                        </div>
                    </div>
                </div>
            ))}

            <div className="text-center p-8 bg-primary text-primary-foreground rounded-lg">
                🎉 You reached the bottom! The layout works perfectly.
            </div>
        </div>
    );
};

export default LongPage;