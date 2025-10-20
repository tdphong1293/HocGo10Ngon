import { menuConfig } from "@/config/menuConfig"
import Link from "next/link"
import { Icon } from "@iconify/react";
import Logo from "./Logo";
import LogoV3 from "./LogoV3";

interface NavbarProps {
    menuConfig?: typeof menuConfig;
}

const Navbar: React.FC<NavbarProps> = ({ menuConfig }) => {
    return (
        <div className="w-full sticky top-0 flex justify-between items-center p-4 text-accent-foreground bg-accent">
            <Logo width={100} height={100} className="text-accent-foreground -mt-9.5" href="/" />
            {/* <LogoV3 width={100} height={100} className="-my-5" href="/" textColor="var(--accent-foreground)" bgColor="var(--accent)" /> */}
            <div className={`flex gap-20`}>
                {menuConfig?.map((item) => (
                    <Link key={`menu-${item.title}`} href={item.href} className="text-2xl">
                        {item.title}
                    </Link>
                ))}
            </div>
            <div className="flex gap-2 items-center">
                <div className="border-2 border-border rounded-full p-2 bg-primary">
                    <Icon icon="mingcute:user-2-fill" width={30} height={30} className="text-primary-foreground" />
                </div>
                <span className="text-xl">Blanker1293</span>
            </div>
            <Link
                className="p-2 text-xl bg-accent text-accent-foreground rounded-lg border-2 border-border hover:cursor-pointer hover:bg-primary/50 hover:text-primary-foreground transition-colors"
                href="/login"
            >
                Đăng nhập
            </Link>
        </div>
    );
}

export default Navbar;