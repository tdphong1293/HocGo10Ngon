'use client';

import Textarea from "@/components/Textarea";
import Select from "@/components/Select";
import Button from "@/components/Button";
import { RadioGroup, RadioGroupItem } from "@/components/RadioGroup";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getAllLanguages, addLanguage } from "@/services/language.services";
import Input from "@/components/Input";
import { toast } from "react-toastify";
import { getLessonLastOrder, addLesson } from "@/services/lesson.services";

const AdminNewLessonPage = () => {
    const { user, isAuthenticated, accessToken, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated || !accessToken || !user || user.role !== 'ADMIN') {
                router.push('/');
            }
        }
    }, [user, isAuthenticated, accessToken, loading, router]);

    const [languageOptions, setLanguageOptions] = useState<{ value: string; label: string }[]>([]);

    const fetchLanguages = async () => {
        try {
            const response = await getAllLanguages();
            const { data } = await response.json();
            if (response.ok) {
                const options = data.languages.map((lang: any) => ({
                    value: lang.languageid,
                    label: `${lang.languageName}, ${lang.languageCode}`,
                }));
                setLanguageOptions(options);
            }
        } catch (err) {
            toast.error("Đã có lỗi xảy ra khi tải ngôn ngữ.");
        }
    };

    useEffect(() => {
        fetchLanguages();
    }, []);

    const [selectedLanguage, setSelectedLanguage] = useState<string>("");
    const [lessonContent, setLessonContent] = useState("");
    const [selectedRadio, setSelectedRadio] = useState("BOTH_HANDS");
    const [lessonTitle, setLessonTitle] = useState("");
    const [lessonOrder, setLessonOrder] = useState("");
    const [lastOrder, setLastOrder] = useState(0);
    const [errors, setErrors] = useState<{ lessonTitle?: string, lessonOrder?: string }>({});

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileClick = () => {
        fileInputRef.current?.click();
    }

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (
            (file.type && file.type !== "text/plain") ||
            (file.name && !file.name.toLowerCase().endsWith(".txt"))
        ) {
            toast.error("Vui lòng chỉ tải lên file văn bản (.txt).");
            event.target.value = '';
            return;
        }

        try {
            const text = await file.text();
            setLessonContent(text);
        } catch (err) {
            toast.error("Đã có lỗi xảy ra khi đọc file.");
        } finally {
            event.target.value = '';
        }
    }

    const handleLanguageChange = async (val: string, isNew?: boolean) => {
        if (!isNew) {
            setSelectedLanguage(val);
            return;
        }
        if (user && isAuthenticated && accessToken && user.role === 'ADMIN') {
            const newLanguage = val.split(',').map(s => s.trim());
            if (newLanguage.length !== 2) {
                toast.warn("Vui lòng nhập ngôn ngữ mới theo định dạng: Tên ngôn ngữ, Mã ngôn ngữ (ví dụ: Tiếng Việt, vi)");
                return;
            }
            const response = await (addLanguage(accessToken, newLanguage[0], newLanguage[1]));
            if (response.ok) {
                const { data } = await response.json();
                toast.success("Đã thêm ngôn ngữ mới thành công.");
                setSelectedLanguage(data.language.languageid);
                fetchLanguages();
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || "Đã có lỗi xảy ra khi thêm ngôn ngữ mới.");
            }
        }
        else {
            toast.warn("Chỉ ADMIN mới có quyền tạo lựa chọn mới.");
        }
    }

    const clearAllErrors = () => {
        setErrors({});
    }

    const clearAllInputs = () => {
        setSelectedRadio("BOTH_HANDS");
        setSelectedLanguage("");
        setLessonContent("");
        setLessonTitle("");
        setLessonOrder("");
    }

    const vailidateInputs = () => {
        clearAllErrors();
        let isValid = true;
        if (!lessonTitle || lessonTitle.trim() === "") {
            setErrors(prev => ({ ...prev, lessonTitle: "Tiêu đề bài học không được để trống." }));
            isValid = false;
        }
        const textRegex = /^[a-zA-ZÀ-ỹ0-9\s.,'"!?()-_]{1,100}$/u;
        if (!textRegex.test(lessonTitle)) {
            setErrors(prev => ({ ...prev, lessonTitle: "Tiêu đề bài học chỉ được chứa chữ cái, số, khoảng trắng và các ký tự: . , ' \" ! ? ( ) - _, tối đa 100 ký tự." }));
            isValid = false;
        }
        const orderNum = parseInt(lessonOrder, 10);
        if (isNaN(orderNum) || orderNum < 1 || orderNum > lastOrder + 1) {
            setErrors(prev => ({ ...prev, lessonOrder: `Số thứ tự bài học phải là số từ 1 đến ${lastOrder + 1}.` }));
            isValid = false;
        }
        return isValid;
    }

    const handleAddLesson = async () => {
        if (!vailidateInputs()) return;
        if (!selectedLanguage || selectedLanguage.trim() === "") {
            toast.warn("Vui lòng chọn ngôn ngữ cho đoạn văn bản.");
            return;
        }
        if (!lessonContent || lessonContent.trim() === "") {
            toast.warn("Vui lòng nhập nội dung bài học.");
            return;
        }
        const lessonContentRegex = /^(?=.*\S)[\u0009\u000A\u000D\u2028\u2029\u0020-\u007E\u00A0-\u024F]{1,5000}$/;
        if (lessonContent && !lessonContentRegex.test(lessonContent)) {
            toast.warn("Nội dung bài học chỉ được chứa chữ cái, số, dấu câu và các ký tự khoảng trắng hợp lệ, tối đa 5000 ký tự.");
            return;
        }

        try {
            const lessonData = {
                languageid: selectedLanguage,
                title: lessonTitle,
                lessonContent,
                orderNumber: parseInt(lessonOrder, 10),
                lessonType: selectedRadio === "BOTH_HANDS" ? "BOTH_HANDS" : "ONE_HANDED",
                ...(selectedRadio === "LEFT_HAND" ? { heldKey: "j" } : (selectedRadio === "RIGHT_HAND" ? { heldKey: "f" } : {})),
            };

            const response = await addLesson(accessToken!, lessonData);
            if (response.ok) {
                toast.success("Đã thêm bài học mới thành công.");
                clearAllInputs();
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || "Đã có lỗi xảy ra khi thêm bài học.");
            }
        }
        catch (err) {
            toast.error("Đã có lỗi xảy ra khi thêm bài học.");
        }
    }

    useEffect(() => {
        const fetchLastOrder = async () => {
            if (isAuthenticated && accessToken && user && user.role === 'ADMIN') {
                const response = await getLessonLastOrder(accessToken);
                if (response.ok) {
                    const { data: lastOrder } = await response.json();
                    setLastOrder(lastOrder);
                    setLessonOrder((lastOrder + 1).toString());
                }
            }
        }
        fetchLastOrder();
    }, [isAuthenticated, accessToken, user]);

    if (!isAuthenticated || !accessToken || !user || user.role !== 'ADMIN') {
        return null;
    }

    return (
        <div className="h-full p-4 flex flex-col gap-4">
            <span className="text-3xl font-semibold">Thêm bài học</span>
            <div className={`flex gap-4 items-start justify-center h-190 w-full`}>
                <div className="flex flex-col gap-4 h-full w-5/8">
                    <div className="flex flex-col gap-1 h-full w-full">
                        <label htmlFor="new-lesson-input">Ô nhập nội dung bài học</label>
                        <Textarea
                            id="new-lesson-input"
                            placeholder="Nhập nội dung bài học mới..."
                            className={`p-4 border-2 border-border rounded-lg h-full bg-background text-foreground`}
                            value={lessonContent}
                            onChange={(e) => setLessonContent(e.target.value)}
                        />
                        <span className="text-sm text-muted-foreground">{`Lưu ý: Nội dung bài học có quan tâm dấu xuống dòng ("\\n") và dấu tab ("\\t").`}</span>
                    </div>
                    <div className="flex flex-row-reverse justify-around">
                        <Button variant="primary" size="medium" className="w-45" onClick={handleAddLesson}>Thêm bài học</Button>
                        <Button variant="destructive-outline" size="medium" className="w-45" onClick={() => setLessonContent("")}>Làm sạch nội dung</Button>
                        <Button variant="primary-outline" size="medium" className="w-45" onClick={handleFileClick}>Nhập từ file</Button>
                        <input
                            type="file"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            multiple={false}
                            accept=".txt,text/plain"
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-6 h-full w-2/8">
                    <Select
                        id="language-select"
                        label="Ngôn ngữ"
                        placeholder="Chọn ngôn ngữ"
                        options={languageOptions}
                        className="w-full"
                        value={selectedLanguage}
                        onChange={handleLanguageChange}
                        allowCreate={true}
                    />
                    <div className="flex flex-col gap-4 items-center justify-center">
                        <div className="flex gap-4 text-accent-foreground">
                            <div className="flex gap-3 items-center">
                                <div className="w-8 h-8 bg-accent flex items-center justify-center rounded-sm">
                                    {lastOrder > 0 ? 1 : 0}
                                </div>
                                <span>
                                    Số thứ tự đầu
                                </span>
                            </div>
                            <div className="flex gap-3 items-center">
                                <div className="w-8 h-8 bg-accent flex items-center justify-center rounded-sm">
                                    {lastOrder}
                                </div>
                                <span>
                                    Số thứ tự cuối
                                </span>
                            </div>
                        </div>
                        <Input
                            label="Số thứ tự bài học"
                            value={lessonOrder}
                            onChange={(val) => setLessonOrder(val)}
                            error={errors.lessonOrder}
                            type="number"
                        />
                        <span className="text-sm text-muted-foreground">Lưu ý: Thứ tự bài học nếu trùng sẽ thay thế vị trí của bài học được chỉ định và thay đổi thứ tứ các bài học khác có liên quan 1 đơn vị.</span>
                        <span className="text-sm text-muted-foreground">Lưu ý: Đối với bài học mới thì số thứ tự bài học tối đa là số thứ tự cuối cùng + 1</span>
                    </div>
                    <Input
                        label="Tiêu đề bài học"
                        value={lessonTitle}
                        onChange={(val) => setLessonTitle(val)}
                        error={errors.lessonTitle}
                    />
                    <div className="flex flex-col gap-1">
                        <label>Chế độ gõ</label>
                        <RadioGroup
                            value={selectedRadio}
                            onValueChange={setSelectedRadio}
                            className="space-y-2"
                        >
                            <RadioGroupItem value="BOTH_HANDS">Cả hai tay</RadioGroupItem>
                            <RadioGroupItem value="LEFT_HAND">Tay trái (tay phải giữ phím J)</RadioGroupItem>
                            <RadioGroupItem value="RIGHT_HAND">Tay phải (tay trái giữ phím F)</RadioGroupItem>
                        </RadioGroup>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminNewLessonPage;