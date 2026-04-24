"use client";

import { Role, MenuItem, menuConfig } from '@/config/menuConfig';
import Link from "next/link"
import { Icon } from "@iconify/react";
import Button from "./Button";
import Logo from "./Logo";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from 'framer-motion';
import Personalization from './Personalization';
import Tooltip from './Tooltip';

interface NavbarProps {
    menuConfig?: typeof menuConfig;
}

const Navbar: React.FC<NavbarProps> = ({
    menuConfig,
}) => {
    const { signOut, accessToken, isAuthenticated, user } = useAuth();
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const activeSubmenu = menuConfig?.[user?.role || Role.USER].find((item) => item.title === activeMenu)?.submenu;
    const [personalizationOpen, setPersonalizationOpen] = useState<boolean>(false);
    const personalizationRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: PointerEvent) => {
            if (!personalizationRef.current) {
                return;
            }

            if (!personalizationRef.current.contains(event.target as Node)) {
                setPersonalizationOpen(false);
            }
        };

        document.addEventListener('pointerdown', handleClickOutside);

        return () => {
            document.removeEventListener('pointerdown', handleClickOutside);
        };
    }, []);

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
                <div className="flex gap-3 items-center">
                    <div
                        ref={personalizationRef}
                        className="relative"
                    >
                        <Tooltip
                            text="Tùy chỉnh cá nhân"
                            side="left"
                        >
                            <div
                                className="rounded-full p-1 bg-background border-2 border-primary text-foreground hover:text-primary-foreground hover:bg-primary/80 transition-colors cursor-pointer"
                                onClick={() => setPersonalizationOpen((prev) => !prev)}
                            >
                                <Icon
                                    icon="fluent:draw-text-24-filled"
                                    className="size-7"
                                />
                            </div>
                        </Tooltip>
                        <AnimatePresence>
                            {personalizationOpen && (
                                <motion.div
                                    className="absolute mt-0.5 top-full right-0 z-60 w-[80vw] sm:w-[70vw] md:w-[60vw] lg:w-[50vw] xl:w-[30vw] h-[85vh] transition-all"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "85vh" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                                >
                                    <Personalization />
                                </motion.div>
                            )}
                        </AnimatePresence>
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
                                        className="absolute mt-0.5 top-full right-0 bg-accent border-2 border-border rounded-lg shadow-lg z-100 flex flex-col text-accent-foreground w-48"
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
            </div>
            {
                activeMenu && activeSubmenu && (
                    <AnimatePresence>
                        <motion.div
                            className="bg-accent border-t-2 border-b-2 border-border flex justify-between items-center gap-10 px-10 py-2 text-accent-foreground"
                            initial={{ opacity: 0, scaleY: 0, y: -8 }}
                            animate={{ opacity: 1, scaleY: 1, y: 0 }}
                            exit={{ opacity: 0, scaleY: 0, y: -8 }}
                            transition={{ duration: 0.35, ease: 'easeInOut' }}
                            style={{ transformOrigin: 'top' }}
                        >
                            {activeSubmenu.map((subitem: MenuItem) => (
                                <motion.div
                                    key={`submenu-${subitem.title}`}
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.2, ease: 'easeOut' }}
                                >
                                    <Link
                                        href={subitem.href}
                                        className="hover:text-primary font-bold transition-all"
                                        onClick={() => setActiveMenu(null)}
                                    >
                                        {subitem.title}
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                )
            }
        </div >
    );
}

export default Navbar;