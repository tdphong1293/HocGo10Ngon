interface MenuItem {
    title: string;
    href: string;
    submenu?: MenuItem[];
}

export const menuConfig: MenuItem[] = [
    { title: 'Luyện tập', href: '/practice' },
    { title: 'Bài học', href: '/lessons' },
    { title: 'Thông số', href: '/stats' },
];