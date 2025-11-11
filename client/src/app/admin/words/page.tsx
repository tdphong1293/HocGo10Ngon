import Textarea from "@/components/Textarea";
import Select from "@/components/Select";
import Button from "@/components/Button";

const AdminWordsPage = () => {
    const testOptions = [
        { value: 'en', label: 'English' },
        { value: 'es', label: 'Spanish' },
        { value: 'fr', label: 'French' },
    ]

    return (
        <div className="h-full p-4 flex flex-col gap-4">
            <span className="text-3xl font-semibold">Quản lý từ ngữ</span>
            <div className={`flex gap-4 items-start justify-center h-190 w-full`}>
                <div className="flex flex-col gap-4 h-full w-3/6">
                    <div className="flex flex-col gap-1 h-full w-full">
                        <label htmlFor="new-words-input">Ô nhập từ cần thêm (cách nhau bởi dấu phẩy ",")</label>
                        <Textarea
                            id="new-words-input"
                            placeholder="Nhập từ mới..."
                            className={`p-4 border-2 border-border rounded-lg h-full bg-background text-foreground`}
                        />
                        <span className="text-sm text-muted-foreground">Lưu ý: Các từ đã có trong hệ thống, bất kể hoa thường hay ngôn ngữ sẽ không được thêm lại.</span>
                    </div>
                    <div className="flex flex-row-reverse justify-around">
                        <Button variant="primary" size="medium" className="w-40">Thêm từ</Button>
                        <Button variant="destructive-outline" size="medium" className="w-40">Làm sạch ô thêm</Button>
                        <Button variant="primary-outline" size="medium" className="w-40">Nhập từ file</Button>
                    </div>
                </div>
                <div className="flex flex-col gap-4 h-full w-2/6">
                    <Select
                        id="language-select"
                        label="Ngôn ngữ"
                        placeholder="Chọn ngôn ngữ"
                        options={testOptions}
                        className="w-full"
                    />
                    <div className="flex flex-col gap-1 h-full">
                        <label htmlFor="delete-words-input">Ô nhập từ cần xóa (cách nhau bởi dấu phẩy ",")</label>
                        <Textarea
                            id="delete-words-input"
                            placeholder="Nhập từ cần xóa..."
                            className={`p-4 border-2 border-border rounded-lg h-full bg-background text-foreground`}
                        />
                        <span className="text-sm text-muted-foreground">Lưu ý: Các từ chưa có trong hệ thống, bất kể hoa thường hay ngôn ngữ sẽ không được xóa.</span>
                    </div>
                    <div className="flex flex-row-reverse justify-around">
                        <Button variant="destructive" size="medium" className="w-40">Xóa từ</Button>
                        <Button variant="destructive-outline" size="medium" className="w-40">Làm sạch ô xóa</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminWordsPage;