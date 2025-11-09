export interface MenuItem {
    title: string;
    href: string;
    submenu?: MenuItem[];
}

export const enum Role {
    BLANK = 'BLANK',
    USER = 'USER',
    ADMIN = 'ADMIN',
}

export const menuConfig: Record<Role, MenuItem[]> = {
    [Role.BLANK]: [],
    [Role.USER]: [
        { title: 'Luyện tập', href: '/practice' },
        { title: 'Bài học', href: '/lessons' },
        { title: 'Tùy chỉnh giao diện', href: '/preferences' },
    ],
    [Role.ADMIN]: [
        { title: 'Luyện tập', href: '/practice' },
        { title: 'Tùy chỉnh giao diện', href: '/preferences' },
        {
            title: 'Quản lý', href: '#', submenu: [
                { title: 'Quản lý từ ngữ', href: '/admin/words' },
                { title: 'Quản lý đoạn văn bản', href: '/admin/paragraphs' },
                { title: 'Quản lý bài học', href: '/admin/lessons' },
            ]
        }
    ]
}