export interface MenuItem {
    title: string;
    href: string;
    submenu?: MenuItem[];
}

export const enum Role {
    USER = 'USER',
    ADMIN = 'ADMIN',
}

export const menuConfig: Record<Role, MenuItem[]> = {
    [Role.USER]: [
        { title: 'Luyện tập', href: '/practice' },
        { title: 'Bài học', href: '/lessons' },
        { title: 'Cài đặt', href: '/settings' },
    ],
    [Role.ADMIN]: [
        { title: 'Luyện tập', href: '/practice' },
        { title: 'Tùy chỉnh', href: '/admin-settings' },
    ]
}