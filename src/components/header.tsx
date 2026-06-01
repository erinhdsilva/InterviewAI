import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/clerk-react"
import { Container } from "./container";
import { LogoContainer } from "./logocontainer";
import { NavigationRoutes } from "./navigation-routes";
import { NavLink } from "react-router-dom";
import { ProfileContainer } from "./profile-container";
import { ToggleContainer } from "./toggle-container";

const Header = () => {
  const { userId } = useAuth();
  return (
    <header className={cn("w-full border-b duration-150 transition-all ease-in-out")}>
      <Container>
        <div className="flex items-center gap-4 w-full">
          {/* logo section */}

          <LogoContainer />


          {/* Navigation section */}



          <div className="w-full flex justify-center">
            <nav className="flex items-center gap-10">
              <NavigationRoutes />
              {userId && (
                <NavLink
                  to={"/generate"}
                  className={({ isActive }) =>
                    cn(
                      "text-base text-neutral-600 hover:text-[#4F46E5] transition-colors",
                      isActive && "text-[#4F46E5] font-semibold"
                    )
                  }
                >
                  Take an interview
                </NavLink>
              )}
            </nav>
          </div>

          <div className="ml-auto flex items-center gap-6">
            {/* profile section */}
            <ProfileContainer />
            {/* mobile toggle section */}
            <ToggleContainer />
          </div>

        </div>
      </Container>
    </header>
  )
}

export default Header
