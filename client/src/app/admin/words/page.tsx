'use client';

import Textarea from "@/components/Textarea";
import Select from "@/components/Select";
import Button from "@/components/Button";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { addWords, deleteWords } from "@/services/word.services";
import { getAllLanguages, addLanguage } from "@/services/language.services";

const AdminWordsPage = () => {
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

    const [addWordsList, setAddWordsList] = useState<string[]>([]);
    const [deleteWordsList, setDeleteWordsList] = useState<string[]>([]);
    const [selectedLanguage, setSelectedLanguage] = useState<string>("");
    const [newWordsInput, setNewWordsInput] = useState<string>("");
    const [deleteWordsInput, setDeleteWordsInput] = useState<string>("");

    useEffect(() => {
        const parsedAddWords = newWordsInput
            .split(',')
            .map(word => word.trim())
            .filter(word => word.length > 0);
        setAddWordsList(parsedAddWords);
    }, [newWordsInput]);

    useEffect(() => {
        const parsedDeleteWords = deleteWordsInput
            .split(',')
            .map(word => word.trim())
            .filter(word => word.length > 0);
        setDeleteWordsList(parsedDeleteWords);
    }, [deleteWordsInput]);

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
            if (newWordsInput !== "") {
                setNewWordsInput(prev => prev + ', ' + text);
            }
            else {
                setNewWordsInput(text);
            }
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

    const handleAddWords = async () => {
        if (addWordsList.length === 0) {
            toast.warn("Vui lòng nhập từ cần thêm.");
            return;
        }

        if (!selectedLanguage || selectedLanguage.trim() === "") {
            toast.warn("Vui lòng chọn ngôn ngữ trước khi thêm từ.");
            return;
        }

        try {
            const response = await addWords(accessToken!, addWordsList, selectedLanguage);
            const { data } = await response.json();
            if (response.ok) {
                toast.success(data.message);
                setNewWordsInput("");
                setSelectedLanguage("");
            }
        } catch (err) {
            toast.error("Đã có lỗi xảy ra khi thêm từ.");
        }
    }

    const handleDeleteWords = async () => {
        if (deleteWordsList.length === 0) {
            toast.warn("Vui lòng nhập từ cần xóa.");
            return;
        }

        try {
            const response = await deleteWords(accessToken!, deleteWordsList);
            const { data } = await response.json();
            if (response.ok) {
                toast.success(data.message);
                setDeleteWordsInput("");
            }
        } catch (err) {
            toast.error("Đã có lỗi xảy ra khi xóa từ.");
        }
    }

    if (!isAuthenticated || !accessToken || !user || user.role !== 'ADMIN') {
        return null;
    }

    return (
        <div className="h-full p-4 flex flex-col gap-4">
            <span className="text-3xl font-semibold">Quản lý từ ngữ</span>
            <div className={`flex gap-4 items-start justify-center h-190 w-full`}>
                <div className="flex flex-col gap-4 h-full w-3/6">
                    <div className="flex flex-col gap-1 h-full w-full">
                        <label htmlFor="new-words-input">{`Ô nhập từ cần thêm (cách nhau bởi dấu phẩy ",")`}</label>
                        <Textarea
                            id="new-words-input"
                            placeholder="Nhập từ mới..."
                            className={`p-4 border-2 border-border rounded-lg h-full bg-background text-foreground`}
                            value={newWordsInput}
                            onChange={(e) => setNewWordsInput(e.target.value)}
                        />
                        <span className="text-sm text-muted-foreground">Lưu ý: Các từ đã có trong hệ thống, bất kể hoa thường hay ngôn ngữ sẽ không được thêm lại.</span>
                    </div>
                    <div className="flex flex-row-reverse justify-around">
                        <Button variant="primary" size="medium" className="w-40" onClick={handleAddWords}>Thêm từ</Button>
                        <Button variant="destructive-outline" size="medium" className="w-40" onClick={() => setNewWordsInput("")}>Làm sạch ô thêm</Button>
                        <Button variant="primary-outline" size="medium" className="w-40" onClick={handleFileClick}>Nhập từ file</Button>
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
                <div className="flex flex-col gap-4 h-full w-2/6">
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
                    <div className="flex flex-col gap-1 h-full">
                        <label htmlFor="delete-words-input">{`Ô nhập từ cần xóa (cách nhau bởi dấu phẩy ",")`}</label>
                        <Textarea
                            id="delete-words-input"
                            placeholder="Nhập từ cần xóa..."
                            className={`p-4 border-2 border-border rounded-lg h-full bg-background text-foreground`}
                            value={deleteWordsInput}
                            onChange={(e) => setDeleteWordsInput(e.target.value)}
                        />
                        <span className="text-sm text-muted-foreground">Lưu ý: Các từ chưa có trong hệ thống, bất kể hoa thường hay ngôn ngữ sẽ không được xóa.</span>
                    </div>
                    <div className="flex flex-row-reverse justify-around">
                        <Button variant="destructive" size="medium" className="w-40" onClick={handleDeleteWords}>Xóa từ</Button>
                        <Button variant="destructive-outline" size="medium" className="w-40" onClick={() => setDeleteWordsInput("")}>Làm sạch ô xóa</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminWordsPage;