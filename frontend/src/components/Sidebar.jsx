import { useEffect, useState, useRef } from "react";
import { Menu, Search } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useContactStore } from "../store/useContactStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import SearchOverlay from "./SearchOverlay";
import ProfileView from "./ProfileView";
import { Check, CheckCheck } from "lucide-react";
import { formatTime } from "../lib/utils";

const Sidebar = () => {
  const { users, getUsers, isUsersLoading, updateUserInSidebar } = useContactStore();
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers, logout, authUser, socket } = useAuthStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showMenuOptions, setShowMenuOptions] = useState(false);
  const [showProfileView, setShowProfileView] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  useEffect(() => {
    if (!socket) return;

    socket.on("sidebarUpdate", (updatedUser) => {
      console.log("Sidebar update received:", updatedUser);
      updateUserInSidebar(updatedUser);
    });

    return () => {
      socket.off("sidebarUpdate");
    };
  }, [socket, updateUserInSidebar]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenuOptions(false);
      }
    };

    if (showMenuOptions) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenuOptions]);

  if (isUsersLoading) return <SidebarSkeleton />;

  const filteredUsers = showSearch
    ? users
    : users.filter((user) =>
      user.userName.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <aside className="relative w-full h-full bg-[#1e1e1e] flex flex-col shadow-[inset_-2px_0_2px_rgba(255,255,255,0.05)]">
      {showProfileView ? (
        <ProfileView
          user={authUser}
          onBack={() => setShowProfileView(false)}
        />
      ) : (
        <>
          <div className="p-4 flex items-center gap-3 border-b border-gray-900 relative">
            <div className="relative" ref={menuRef}>
              <Menu
                className="text-gray-400 cursor-pointer"
                onClick={() => setShowMenuOptions((prev) => !prev)}
              />
              {showMenuOptions && (
                <div className="absolute top-full left-0 mt-2 bg-[#2c2c2c] rounded shadow-lg overflow-hidden z-50 w-40">
                  <button
                    onClick={() => {
                      setShowProfileView(true);
                      setShowMenuOptions(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#3a3a3a]"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setShowMenuOptions(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#3a3a3a]"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onFocus={() => setShowSearch(true)}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#2c2c2c] text-white p-2 pl-9 rounded-full w-full outline-none text-sm"
              />
            </div>
          </div>

          {showSearch && (
            <SearchOverlay
              onClose={() => {
                setShowSearch(false);
                setSearchTerm("");
              }}
            />
          )}

          <div className="flex-1 overflow-y-auto">
            {filteredUsers.map((user) => {
              const isSelected = selectedUser?._id === user._id;
              const isOnline = onlineUsers.includes(user._id);

              return (
                <div
                  key={user._id}
                  onClick={() => {
                    setSelectedUser(user);
                    socket.emit("markMessagesAsSeen", { senderId: user._id });
                    updateUserInSidebar({
                      senderId: user._id,
                      unreadCount: 0,
                    }, false);
                  }}
                  className={`cursor-pointer px-4 py-3 border-b border-gray-800 hover:bg-[#2c2c2c] transition-colors ${isSelected ? "bg-[#2c2c2c]" : ""
                    }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={user.profilePic || "/avatar.png"}
                          alt={user.userName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        {isOnline && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#1e1e1e] rounded-full" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-white text-sm font-medium truncate w-[160px]">
                          {user.userName}
                        </h3>
                        <p className="text-gray-400 text-xs truncate max-w-[160px] flex items-center gap-1">
                          {user.latestMessageSenderId === authUser._id &&
                            user.latestMessage !== "__deleted__" &&
                            !!user.latestMessage && (
                              <>
                                {!user.isDelivered ? (
                                  <Check className="w-3 h-3 text-gray-400" />
                                ) : user.isSeen ? (
                                  <CheckCheck className="w-3 h-3 text-blue-400" />
                                ) : (
                                  <CheckCheck className="w-3 h-3 text-gray-400" />
                                )}
                              </>
                            )}
                          {user.latestMessage
                            ? user.latestMessage === "__deleted__"
                              ? "This message was deleted"
                              : user.latestMessageType === "image"
                                ? "📷 Photo"
                                : user.latestMessage
                            : "Start chatting"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {user.latestMessageTime && (
                        <span className="text-[10px] text-muted-foreground">
                          {formatTime(user.latestMessageTime)}
                        </span>
                      )}
                      {user.unreadCount > 0 && (
                        <span className="text-xs text-white bg-green-500 rounded-full px-2 py-[2px] font-medium">
                          {user.unreadCount > 9 ? "9+" : user.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredUsers.length === 0 && (
              <div className="text-center text-gray-500 py-6">
                No contacts found
              </div>
            )}
          </div>
        </>
      )}
    </aside>
  );
};

export default Sidebar;
