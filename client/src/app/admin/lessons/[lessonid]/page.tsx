'use client';

import Textarea from "@/components/Textarea";
import Select from "@/components/Select";
import Button from "@/components/Button";
import { RadioGroup, RadioGroupItem } from "@/components/RadioGroup";
import { use, useState } from "react";
import Input from "@/components/Input";

const AdminSingleLessonPage: React.FC<PageProps<"/admin/lessons/[lessonid]">> = ({
    params
}) => {
    const testOptions = [
        { value: 'en', label: 'English' },
        { value: 'es', label: 'Spanish' },
        { value: 'fr', label: 'French' },
    ]

    const { lessonid } = use(params);

    const [selectedRadio, setSelectedRadio] = useState("two-hand");
    const [lessonTitle, setLessonTitle] = useState("");
    const [lessonOrder, setLessonOrder] = useState("");
    const [errors, setErrors] = useState<{ lessonTitle?: string, lessonOrder?: string }>({});

    return (
        <div className="h-full p-4 flex flex-col gap-4">
            <span className="text-3xl font-semibold">Chỉnh sửa bài học</span>
            <div className={`flex gap-4 items-start justify-center h-190 w-full`}>
                <div className="flex flex-col gap-4 h-full w-5/8">
                    <div className="flex flex-col gap-1 h-full w-full">
                        <label htmlFor="edit-lesson-input">Ô nhập nội dung bài học</label>
                        <Textarea
                            id="edit-lesson-input"
                            placeholder="Nhập nội dung bài học cần chỉnh sửa..."
                            className={`p-4 border-2 border-border rounded-lg h-full bg-background text-foreground`}
                        />
                        <span className="text-sm text-muted-foreground">{`Lưu ý: Nội dung bài học có quan tâm dấu xuống dòng ("\\n") và dấu tab ("\\t").`}</span>
                    </div>
                    <div className="flex flex-row-reverse justify-between">
                        <Button variant="primary" size="medium" className="w-45">Lưu chỉnh sửa</Button>
                        <Button variant="secondary" size="medium" className="w-45">Hủy bỏ thay đổi</Button>
                        <Button variant="destructive-outline" size="medium" className="w-45">Làm sạch nội dung</Button>
                        <Button variant="primary-outline" size="medium" className="w-45">Nhập từ file</Button>
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
                    <div className="flex flex-col gap-4 items-center justify-center">
                        <div className="flex gap-4 text-accent-foreground">
                            <div className="flex gap-3 items-center">
                                <div className="w-8 h-8 bg-accent flex items-center justify-center rounded-sm">
                                    1
                                </div>
                                <span>
                                    Số thứ tự đầu
                                </span>
                            </div>
                            <div className="flex gap-3 items-center">
                                <div className="w-8 h-8 bg-accent flex items-center justify-center rounded-sm">
                                    2
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
                            <RadioGroupItem value="two-hand">Cả hai tay</RadioGroupItem>
                            <RadioGroupItem value="left-hand">Tay trái (tay phải giữ phím J)</RadioGroupItem>
                            <RadioGroupItem value="right-hand">Tay phải (tay trái giữ phím F)</RadioGroupItem>
                        </RadioGroup>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminSingleLessonPage;