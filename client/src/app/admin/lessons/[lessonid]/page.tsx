'use client';

import Textarea from "@/components/Textarea";
import Select from "@/components/Select";
import Button from "@/components/Button";
import { RadioGroup, RadioGroupItem } from "@/components/RadioGroup";
import { useAuth } from "@/hooks/useAuth";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllLanguages, addLanguage } from "@/services/language.services";
import Input from "@/components/Input";
import { toast } from "react-toastify";
import { getLessonLastOrder, getLessonById, updateLesson } from "@/services/lesson.services";

const AdminSingleLessonPage: React.FC<PageProps<"/admin/lessons/[lessonid]">> = ({
    params
}) => {
    const { user, isAuthenticated, accessToken, loading } = useAuth();
    const [defaultLessonData, setDefaultLessonData] = useState<{
        languageid: string;
        title: string;
        lessonContent: string;
        orderNumber: number;
        lessonType: string;
        heldKey?: string;
    } | null>(null);
    const router = useRouter();

    const { lessonid } = use(params);

    const fetchLessonData = async () => {
        const response = await getLessonById(accessToken!, lessonid);
        if (response.ok) {
            const { data } = await response.json();
            setDefaultLessonData(data);
        }
        else if (response.status === 404) {
            toast.error("Không tìm thấy bài học.");
            router.push("/admin/lessons");
        }
    }

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated || !accessToken || !user || user.role !== 'ADMIN') {
                router.push('/');
            }
            else {
                fetchLessonData();
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

    const isChanged = () => {
        if (!defaultLessonData) return false;
        if (selectedLanguage !== defaultLessonData.languageid) return true;
        if (lessonContent !== defaultLessonData.lessonContent) return true;
        if (lessonTitle !== defaultLessonData.title) return true;
        if (lessonOrder !== defaultLessonData.orderNumber.toString()) return true;
        if (defaultLessonData.lessonType === "BOTH_HANDS" && selectedRadio !== "BOTH_HANDS") return true;
        if (defaultLessonData.lessonType === "ONE_HANDED") {
            if (defaultLessonData.heldKey === "j" && selectedRadio !== "LEFT_HAND") return true;
            if (defaultLessonData.heldKey === "f" && selectedRadio !== "RIGHT_HAND") return true;
        }
        return false;
    }

    const setToDefaultInputs = () => {
        if (defaultLessonData) {
            setSelectedLanguage(defaultLessonData.languageid);
            setLessonContent(defaultLessonData.lessonContent);
            setLessonTitle(defaultLessonData.title);
            setLessonOrder(defaultLessonData.orderNumber.toString());
            if (defaultLessonData.lessonType === "BOTH_HANDS") {
                setSelectedRadio("BOTH_HANDS");
            } else if (defaultLessonData.lessonType === "ONE_HANDED" && defaultLessonData.heldKey === "j") {
                setSelectedRadio("LEFT_HAND");
            } else if (defaultLessonData.lessonType === "ONE_HANDED" && defaultLessonData.heldKey === "k") {
                setSelectedRadio("RIGHT_HAND");
            }
        }
    }

    useEffect(() => {
        setToDefaultInputs();
    }, [defaultLessonData]);

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
            setErrors(prev => ({ ...prev, lessonOrder: `Số thứ tự bài học phải là số từ 1 đến ${lastOrder}.` }));
            isValid = false;
        }
        return isValid;
    }

    const handleUpdateLesson = async () => {
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

        if (!defaultLessonData) {
            toast.error("Dữ liệu bài học không hợp lệ.");
            return;
        }

        const differenceData: { [key: string]: any } = {};
        if (selectedLanguage !== defaultLessonData.languageid) {
            differenceData.languageid = selectedLanguage;
        }
        if (lessonContent !== defaultLessonData.lessonContent) {
            differenceData.lessonContent = lessonContent;
        }
        if (lessonTitle !== defaultLessonData.title) {
            differenceData.title = lessonTitle;
        }
        if (lessonOrder !== defaultLessonData.orderNumber.toString()) {
            differenceData.orderNumber = parseInt(lessonOrder, 10);
        }
        if (defaultLessonData.lessonType === "BOTH_HANDS" && selectedRadio !== "BOTH_HANDS") {
            differenceData.lessonType = "ONE_HANDED";
            differenceData.heldKey = selectedRadio === "LEFT_HAND" ? "j" : "f";
        }
        if (defaultLessonData.lessonType === "ONE_HANDED") {
            if (defaultLessonData.heldKey === "j" && selectedRadio !== "LEFT_HAND") {
                if (selectedRadio === "BOTH_HANDS") {
                    differenceData.lessonType = "BOTH_HANDS";
                    differenceData.heldKey = null;
                }
                else if (selectedRadio === "RIGHT_HAND") {
                    differenceData.heldKey = "f";
                }
            }
            else if (defaultLessonData.heldKey === "f" && selectedRadio !== "RIGHT_HAND") {
                if (selectedRadio === "BOTH_HANDS") {
                    differenceData.lessonType = "BOTH_HANDS";
                    differenceData.heldKey = null;
                }
                else if (selectedRadio === "LEFT_HAND") {
                    differenceData.heldKey = "j";
                }
            }
        }

        if (Object.keys(differenceData).length === 0) {
            toast.info("Không có thay đổi nào để cập nhật.");
            return;
        }

        try {
            const response = await updateLesson(accessToken!, lessonid, differenceData);
            if (response.ok) {
                toast.success("Đã cập nhật bài học thành công.");
                fetchLessonData();
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || "Đã có lỗi xảy ra khi cập nhật bài học.");
            }
        }
        catch (err) {
            toast.error("Đã có lỗi xảy ra khi cập nhật bài học.");
        }
    }

    useEffect(() => {
        const fetchLastOrder = async () => {
            if (isAuthenticated && accessToken && user && user.role === 'ADMIN') {
                const response = await getLessonLastOrder(accessToken);
                if (response.ok) {
                    const { data: lastOrder } = await response.json();
                    setLastOrder(lastOrder);
                }
            }
        }
        fetchLastOrder();
    }, [isAuthenticated, accessToken, user]);

    if (!isAuthenticated || !accessToken || !user || user.role !== 'ADMIN' || !defaultLessonData) {
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
                        <Button variant="primary" size="medium" className="w-45"
                            disabled={!isChanged()}
                            onClick={handleUpdateLesson}
                        >
                            Lưu chỉnh sửa</Button>
                        <Button variant="secondary" size="medium" className="w-45"
                            disabled={!isChanged()}
                            onClick={setToDefaultInputs}
                        >
                            Hủy bỏ thay đổi</Button>
                        <Button variant="destructive-outline" size="medium" className="w-45" onClick={() => setLessonContent("")}>Làm sạch nội dung</Button>
                        <Button variant="primary-outline" size="medium" className="w-45"
                            onClick={() => router.push("/admin/lessons")}
                        >Quay lại</Button>
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
                            placeholder="Nhập số thứ tự bài học khác"
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
                        placeholder="Nhập tiêu đề bài học khác"
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

export default AdminSingleLessonPage;