// import { MainLayout } from "@/layout/main_layout"
import { MainRoutes } from "@/lib/helpers"
import { cn } from "@/lib/utils"
import { NavLink } from "react-router-dom"

interface NavigationRoutesProps {
    isMobile?: boolean
}

export const NavigationRoutes = ({ isMobile = false }: NavigationRoutesProps) => {
    return (
        <ul className={cn("flex items-center justify-center gap-10", isMobile && "items-start flex-col gap-10")}>
            {MainRoutes.map((route) => (
                <NavLink
                    key={route.href}
                    to={route.href}
                    className={({ isActive }) =>
                        cn(
                            "text-base text-neutral-600 hover:text-[#4F46E5] transition-colors",
                            isActive && "text-[#4F46E5] font-semibold"
                        )
                    }
                >
                    {route.label}
                </NavLink>
            ))}
        </ul>
    );
};
