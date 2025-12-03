"use client";

import { Role, MenuItem, menuConfig } from '@/config/menuConfig';
import Link from "next/link"
import { Icon } from "@iconify/react";
import Button from "./Button";
import Logo from "./Logo";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { AnimatePresence, motion } from 'framer-motion';

interface NavbarProps {
    menuConfig?: typeof menuConfig;
}

const Navbar: React.FC<NavbarProps> = ({
    menuConfig,
}) => {
    const { signOut, accessToken, isAuthenticated, user } = useAuth();
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    return (
        <div className="w-full sticky top-0 z-50 flex flex-col">
            <div className={`flex justify-between items-center p-4 text-accent-foreground bg-accent`}>
                <Logo width={100} height={100} className="text-accent-foreground -mt-9.5" href="/" />
                <div className={`flex gap-20`}>
                    {(menuConfig?.[user?.role || Role.USER] || []).map((item: MenuItem) => (
                        <Link
                            key={`menu-${item.title}`}
                            href={item.href}
                            className={`text-2xl transition-all ${activeMenu === item.title ? 'text-primary scale-102' : 'hover:text-primary hover:scale-102'}`}
                            onClick={(e) => {
                                if (item.href === '#') {
                                    e.preventDefault();
                                    setActiveMenu(activeMenu === item.title ? null : item.title);
                                } else {
                                    setActiveMenu(item.title);
                                }
                            }}
                        >
                            {item.title}
                        </Link>
                    ))}
                </div>
                {isAuthenticated && accessToken && user ? (
                    <div
                        className="flex gap-2 items-center relative cursor-pointer hover:text-primary"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        <div className="border-2 border-border rounded-full p-2 bg-primary">
                            <Icon
                                icon="mingcute:user-2-fill"
                                width={20} height={20}
                                className="text-primary-foreground"
                            />
                        </div>
                        <span className="text-xl">{user?.username}</span>
                        <AnimatePresence>
                            {isHovered && (
                                <motion.div
                                    className="absolute top-full right-0 bg-accent border-2 border-border rounded-lg shadow-lg z-100 flex flex-col text-accent-foreground w-48"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                                >
                                    <div
                                        className={`px-2 py-1 flex gap-2 hover:text-primary cursor-pointer hover:bg-primary-foreground rounded-md items-center`}
                                    >
                                        <Icon
                                            icon="material-symbols:settings-rounded"
                                            className="text-md"
                                        />
                                        <Link
                                            href="/account-settings"
                                        >
                                            Cài đặt tài khoản
                                        </Link>
                                    </div>
                                    <div
                                        className={`px-2 py-1 flex gap-1 hover:text-primary cursor-pointer hover:bg-primary-foreground rounded-md items-center`}
                                    >
                                        <Icon
                                            icon="material-symbols:logout-rounded"
                                            className="text-md"
                                        />
                                        <div
                                            className=""
                                            onClick={async () => {
                                                await signOut();
                                            }}
                                        >
                                            Đăng xuất
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <Link
                        href="/authenticate"
                    >
                        <Button variant="primary-outline">
                            Đăng nhập
                        </Button>
                    </Link>
                )}
            </div>
            {activeMenu && menuConfig?.[user?.role || Role.USER].find(item => item.title === activeMenu)?.submenu && (
                <div className="bg-accent border-t-2 border-b-2 border-border flex justify-between items-center gap-10 px-10 py-2 text-accent-foreground">
                    {menuConfig?.[user?.role || Role.USER].find(item => item.title === activeMenu)?.submenu?.map((subitem: MenuItem) => (
                        <Link
                            key={`submenu-${subitem.title}`}
                            href={subitem.href}
                            className="hover:text-primary transition-all"
                        >
                            {subitem.title}
                        </Link>
                    ))}
                </div>
            )}
        </div >
    );
}

export default Navbar;