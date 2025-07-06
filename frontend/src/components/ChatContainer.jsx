import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import { MessageSquareMore, CheckCheck } from "lucide-react";
import dayjs from "dayjs";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime, formatChatDate } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    isSelecting,
    selectedMessageIds,
    toggleSelectedMessage,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser?._id]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const groupedMessages = messages.reduce((groups, msg) => {
    const date = dayjs(msg.createdAt).format("YYYY-MM-DD");
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden bg-base-100">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
            <MessageSquareMore className="w-20 h-20 mb-4 text-gray-500" />
            <p className="text-lg text-gray-400">Say hello to start the conversation!</p>
            <p className="text-sm text-gray-600 mt-1">Your messages will appear here.</p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              <div className="text-center text-xs text-gray-500 my-2">
                {formatChatDate(date)}
              </div>
              {msgs.map((message) => {
                const isSender = message.senderId === authUser._id;
                const isSelected = selectedMessageIds.includes(message._id);
                return (
                  <div
                    key={message._id}
                    className={`chat ${isSender ? "chat-end" : "chat-start"} ${isSelecting && isSelected ? "bg-base-200 rounded" : ""
                      }`}
                    onClick={() => isSelecting && toggleSelectedMessage(message._id)}
                    ref={messageEndRef}
                  >
                    <div className="chat-image avatar">
                      <div className="size-10 rounded-full border">
                        <img
                          src={
                            isSender
                              ? authUser.profilePic || "/avatar.png"
                              : selectedUser.profilePic || "/avatar.png"
                          }
                          alt="profile"
                        />
                      </div>
                    </div>
                    <div className="chat-bubble flex items-end justify-between">
                      <div>
                        {message.isDeleted ? (
                          <span className="italic text-sm text-muted-foreground">
                            This message was deleted
                          </span>
                        ) : (
                          <>
                            {message.image && (
                              <img
                                src={message.image}
                                alt="Attachment"
                                className="sm:max-w-[200px] rounded-md mb-1"
                              />
                            )}
                            {message.text && (
                              <span>{message.text}</span>
                            )}
                          </>
                        )}
                      </div>

                      <div className="flex items-center space-x-1 ml-2">
                        <span className="text-[10px] opacity-70">
                          {formatMessageTime(message.createdAt)}
                        </span>
                        {isSender && !message.isDeleted && (
                          <CheckCheck
                            className="w-3 h-3"
                            style={{ color: message.isSeen ? "#53bdeb" : "gray" }}
                          />
                        )}
                      </div>
                    </div>


                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
