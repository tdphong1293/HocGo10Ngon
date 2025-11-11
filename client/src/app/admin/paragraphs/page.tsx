'use client';

import Textarea from "@/components/Textarea";
import Select from "@/components/Select";
import Button from "@/components/Button";
import { RadioGroup, RadioGroupItem } from "@/components/RadioGroup";
import { useState } from "react";
import Input from "@/components/Input";

const AdminParagraphsPage = () => {
    const testOptions = [
        { value: 'en', label: 'English' },
        { value: 'es', label: 'Spanish' },
        { value: 'fr', label: 'French' },
    ]

    const [selectedRadio, setSelectedRadio] = useState("paragraph");
    const [author, setAuthor] = useState("");
    const [source, setSource] = useState("");
    const [errors, setErrors] = useState<{ author?: string; source?: string }>({});

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
                        />
                        <span className="text-sm text-muted-foreground">Lưu ý: Đoạn văn bản có quan tâm dấu xuống dòng ("\n") và dấu tab ("\t").</span>
                    </div>
                    <div className="flex flex-row-reverse justify-around">
                        <Button variant="primary" size="medium" className="w-50">Thêm đoạn văn bản</Button>
                        <Button variant="destructive-outline" size="medium" className="w-50">Làm sạch ô thêm</Button>
                        <Button variant="primary-outline" size="medium" className="w-50">Nhập từ file</Button>
                    </div>
                </div>
                <div className="flex flex-col gap-6 h-full w-2/8">
                    <Select
                        id="language-select"
                        label="Ngôn ngữ"
                        placeholder="Chọn ngôn ngữ"
                        options={testOptions}
                        className="w-full"
                    />
                    <div className="flex flex-col gap-1">
                        <label>Loại văn bản</label>
                        <RadioGroup
                            value={selectedRadio}
                            onValueChange={setSelectedRadio}
                            className="space-y-2"
                        >
                            <div className="flex gap-5 items-center">
                                <RadioGroupItem value="paragraph">Đoạn văn</RadioGroupItem>
                                <RadioGroupItem value="quote">Câu trích dẫn</RadioGroupItem>
                            </div>
                        </RadioGroup>
                    </div>
                    <div className="flex flex-col gap-6">
                        <Input 
                            label="Tác giả"
                            value={author}
                            onChange={(val) => setAuthor(val)}
                            error={errors.author}
                        />
                        <Input 
                            label="Nguồn"
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