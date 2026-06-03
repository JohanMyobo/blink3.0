import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Home, LayoutGrid, Users, User } from "lucide-react";

const NAV_TABS = [
  { id: "home", label: "Home", Icon: Home, path: "/start" },
  { id: "hub", label: "Hub", Icon: LayoutGrid, path: "/hub" },
  { id: "friends", label: "Friends", Icon: Users, path: "/friends" },
  { id: "profile", label: "Profile", Icon: User, path: "/profile" },
];

export const BottomNav = () => {
  const [location, setLocation] = useLocation();

  const activeTab =
    NAV_TABS.find((tab) => location === tab.path)?.id ?? "home";

  return (
    <motion.nav
      className="flex-shrink-0 bg-white border-t border-[#e8eaed] flex items-center justify-around px-2 pt-2"
      style={{ height: 64 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.1 }}
      data-testid="nav-bottom"
    >
      {NAV_TABS.map(({ id, label, Icon, path }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            data-testid={`nav-tab-${id}`}
            className="flex flex-col items-center justify-center gap-[3px] flex-1 py-1 rounded-xl transition-colors"
            style={{ color: isActive ? "#282145" : "#9FA9BB" }}
            onClick={() => setLocation(path)}
          >
            <div
              className="flex items-center justify-center rounded-full transition-all"
              style={{
                width: 36,
                height: 28,
                background: isActive ? "#f0f1fd" : "transparent",
              }}
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 2}
                color={isActive ? "#282145" : "#9FA9BB"}
              />
            </div>
            <span
              className="text-[11px] leading-[14px]"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: isActive ? 700 : 400,
                color: isActive ? "#282145" : "#9FA9BB",
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </motion.nav>
  );
};
