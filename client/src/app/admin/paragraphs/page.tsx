'use client';

import Textarea from "@/components/Textarea";
import Select from "@/components/Select";
import Button from "@/components/Button";
import { useState, useEffect, useRef } from "react";
import Input from "@/components/Input";
import { useAuth } from "@/hooks/useAuth";
import { getAllLanguages, addLanguage } from "@/services/language.services";
import { createParagraph } from "@/services/paragraph.services";
import { toast } from "react-toastify";
import LoadingSpinner from "@/components/LoadingSpinner";

const AdminParagraphsPage = () => {
    const { user, isAuthenticated, accessToken, loading, requireAuth, setAccessToken, signOut } = useAuth();
    const isGuest = !isAuthenticated || !accessToken || !user || user.role !== 'ADMIN';
    const [authChecked, setAuthChecked] = useState(false);
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
        const checkAuth = async () => {
            const result = await requireAuth(true);
            setAuthChecked(result);
        };
        checkAuth();
    }, []);

    useEffect(() => {
        if (authChecked && !isGuest) {
            fetchLanguages();
        }
    }, [authChecked, isGuest]);

    const [selectedLanguage, setSelectedLanguage] = useState<string>("");

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
            const response = await (addLanguage(accessToken, newLanguage[0], newLanguage[1], setAccessToken, () => signOut("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại")));;
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
            setParagraphText(text);
        } catch (err) {
            toast.error("Đã có lỗi xảy ra khi đọc file.");
        } finally {
            event.target.value = '';
        }
    }

    const [paragraphText, setParagraphText] = useState("");
    const [author, setAuthor] = useState("");
    const [source, setSource] = useState("");
    const [errors, setErrors] = useState<{ author?: string; source?: string }>({});

    const clearAllInputs = () => {
        setSelectedLanguage("");
        setParagraphText("");
        setAuthor("");
        setSource("");
    }

    const clearAllErrors = () => {
        setErrors({});
    }

    const validateInputs = () => {
        clearAllErrors();
        let isValid = true;
        if (!author || author.trim() === "") {
            setErrors(prev => ({ ...prev, author: "Vui lòng nhập tác giả." }));
            isValid = false;
        }
        if (!source || source.trim() === "") {
            setErrors(prev => ({ ...prev, source: "Vui lòng nhập nguồn." }));
            isValid = false;
        }
        const textRegex = /^[\p{L}\p{N}\p{P}\p{S}\p{Zs}]{1,100}$/u;
        if (author && !textRegex.test(author)) {
            setErrors(prev => ({ ...prev, author: "Tác giả chỉ được chứa chữ cái, số, khoảng trắng và các ký tự bàn phím, tối đa 100 ký tự." }));
            isValid = false;
        }
        const textRegex1 = /^[\p{L}\p{N}\p{P}\p{S}\p{Zs}]{1,500}$/u;
        if (source && !textRegex1.test(source)) {
            setErrors(prev => ({ ...prev, source: "Nguồn chỉ được chứa chữ cái, số, khoảng trắng và các ký tự bàn phím, tối đa 500 ký tự." }));
            isValid = false;
        }
        return isValid;
    }

    const handleCreateParagraph = async () => {
        if (!validateInputs()) return;
        if (!selectedLanguage || selectedLanguage.trim() === "") {
            toast.warn("Vui lòng chọn ngôn ngữ cho đoạn văn bản.");
            return;
        }
        if (!paragraphText || paragraphText.trim() === "") {
            toast.warn("Vui lòng nhập đoạn văn bản cần thêm.");
            return;
        }
        const paragraphRegex = /^(?=.*\S)[\p{L}\p{M}\p{N}\p{P}\p{Z}\t\r\n]{1,5000}$/u;
        if (paragraphText && !paragraphRegex.test(paragraphText)) {
            toast.warn("Đoạn văn bản chỉ được chứa chữ cái, số, dấu câu và các ký tự khoảng trắng hợp lệ, tối đa 5000 ký tự.");
            return;
        }

        try {
            const dataToSend = {
                languageid: selectedLanguage,
                paragraphContent: paragraphText,
                author: author,
                source: source
            }

            const response = await createParagraph(accessToken!, dataToSend, setAccessToken, () => signOut("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại"));
            if (response.ok) {
                const { data } = await response.json();
                toast.success(data.message);
                clearAllInputs();
            }
        } catch (err) {
            toast.error("Đã có lỗi xảy ra khi thêm đoạn văn bản.");
        }
    }

    if (loading) {
        return (
            <div className="h-full w-full flex justify-center items-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (!authChecked || isGuest) {
        return null;
    }

    return (
        <div className="h-full p-4 flex flex-col gap-4">
            <span className="text-3xl font-semibold">Quản lý đoạn văn bản</span>
            <div className={`flex gap-4 items-start justify-center h-190 w-full`}>
                <div className="flex flex-col gap-4 h-full w-5/8">
                    <div className="flex flex-col gap-1 h-full w-full">
                        <label htmlFor="new-paragraphs-input">Ô nhập đoạn văn bản cần thêm (1 đoạn văn bản mỗi lần thêm)</label>
                        <Textarea
                            id="new-paragraphs-input"
                            placeholder="Nhập đoạn văn bản mới..."
                            className={`p-4 border-2 border-border rounded-lg h-full bg-background text-foreground`}
                            value={paragraphText}
                            onChange={(e) => setParagraphText(e.target.value)}
                        />
                        <span className="text-sm text-muted-foreground">{`Lưu ý: Đoạn văn bản có quan tâm dấu xuống dòng ("\\n") và dấu tab ("\\t"). Khi đoạn văn bản được thêm từ file, sẽ ghi đè lên nội dung hiện tại.`}</span>
                    </div>
                    <div className="flex flex-row-reverse justify-around">
                        <Button variant="primary" size="medium" className="w-50" onClick={handleCreateParagraph}>Thêm đoạn văn bản</Button>
                        <Button variant="destructive-outline" size="medium" className="w-50" onClick={() => setParagraphText("")}>Làm sạch ô thêm</Button>
                        <Button variant="primary-outline" size="medium" className="w-50" onClick={handleFileClick}>Nhập từ file</Button>
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
                        value={selectedLanguage}
                        onChange={handleLanguageChange}
                        allowCreate={true}
                        className="w-full"
                    />
                    <div className="flex flex-col gap-6">
                        <Input
                            label="Tác giả"
                            placeholder="Nhập tên tác giả"
                            value={author}
                            onChange={(val) => setAuthor(val)}
                            error={errors.author}
                        />
                        <Input
                            label="Nguồn"
                            placeholder="Nhập nguồn đoạn văn bản"
                            value={source}
                            onChange={(val) => setSource(val)}
                            error={errors.source}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminParagraphsPage;