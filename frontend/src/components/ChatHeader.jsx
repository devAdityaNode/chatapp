import { ArrowLeft, MoreVertical } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useContactStore } from "../store/useContactStore";
import { useEffect, useRef, useState } from "react";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, setIsSelecting, setConfirmAction } = useChatStore();
  const { onlineUsers } = useAuthStore();

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const handleSelectMessages = () => {
    setIsSelecting(true);
    setShowMenu(false);
  };

  const handleClearChat = () => {
    setConfirmAction("clearChat", [selectedUser._id], "chat");
    setShowMenu(false);
  };

  const handleDeleteContact = () => {
    setConfirmAction("deleteContact", [selectedUser._id], "contact");
    setShowMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div className="p-4 border-b border-base-300 bg-base-100 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedUser(null)} className="sm:hidden">
            <ArrowLeft />
          </button>

          <div className="avatar">
            <div className="size-10 rounded-full">
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt={selectedUser.userName}
              />
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-base-content">{selectedUser.userName}</h3>
            <p className="text-sm text-base-content/60">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button onClick={() => setShowMenu(!showMenu)}>
            <MoreVertical />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-base-100 border border-base-300 rounded shadow-lg">
              <button
                onClick={handleSelectMessages}
                className="block w-full text-left p-2 hover:bg-base-200"
              >
                Select messages
              </button>
              <button
                onClick={handleClearChat}
                className="block w-full text-left p-2 hover:bg-base-200"
              >
                Clear chat
              </button>
              <button
                onClick={handleDeleteContact}
                className="block w-full text-left p-2 hover:bg-base-200 text-red-500"
              >
                Delete contact
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;