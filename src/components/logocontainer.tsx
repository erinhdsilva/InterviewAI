import { Link } from "react-router-dom";
import { Bot } from "lucide-react";

export const LogoContainer = () => {
  return (
    <Link
      to="/"
      className="flex items-center gap-2 p-2 rounded-lg transition-all duration-300 hover:shadow-lg hover:bg-violet-50"
    >
      <Bot size={32} className="text-[#4F46E5] transition-transform duration-300 hover:rotate-6" />
      <span className="text-2xl font-bold text-[#4F46E5] whitespace-nowrap">
        MockMate AI
      </span>
    </Link>
  );
};
