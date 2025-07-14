import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import { MessageSquareMore, CheckCheck, Check } from "lucide-react";
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
    subscribeToMessages,
    unsubscribeFromMessages,
    selectedMessageIds,
    toggleSelectedMessage,
  } = useChatStore();

  const { authUser, socket } = useAuthStore();
  const messageEndRef = useRef(null);

  const filteredMessages = messages.filter(
    (msg) => !msg.deletedBy?.includes(authUser._id)
  );


  useEffect(() => {
    if (!selectedUser?._id) return;

    socket.emit("joinChat", { withUserId: selectedUser._id });

    getMessages(selectedUser._id);

    socket.emit("messageSeen", { senderId: selectedUser._id });

    subscribeToMessages();

    return () => {
      socket.emit("leaveChat");
      unsubscribeFromMessages();
    };
  }, [selectedUser?._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // const groupedMessages = messages.reduce((groups, msg) => {
  //   const date = dayjs(msg.createdAt).format("YYYY-MM-DD");
  //   if (!groups[date]) groups[date] = [];
  //   groups[date].push(msg);
  //   return groups;
  // }, {});

  const groupedMessages = filteredMessages.reduce((groups, msg) => {
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
                    <div className="chat-bubble p-2 flex flex-col gap-1 sm:max-w-[300px]">
                      {message.isDeleted ? (
                        <>
                          <div className="flex items-center justify-between gap-2">
                            <span className="italic text-sm text-muted-foreground">
                              This message was deleted
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {formatMessageTime(message.createdAt)}
                            </span>
                          </div>

                        </>
                      ) : (
                        <>
                          {message.image && (
                            <div className="relative">
                              <img
                                src={message.image}
                                alt="Attachment"
                                className="rounded-md"
                              />
                              {!message.text && (
                                <div className="absolute bottom-1 right-1 flex items-center space-x-1 bg-black/50 rounded px-1">
                                  <span className="text-[10px] text-white">
                                    {formatMessageTime(message.createdAt)}
                                  </span>
                                  {isSender && (
                                    <>
                                      {!message.isDelivered ? (
                                        <Check className="w-4 h-4 text-gray-300" />
                                      ) : message.isSeen ? (
                                        <CheckCheck className="w-4 h-4 text-blue-400" />
                                      ) : (
                                        <CheckCheck className="w-4 h-4 text-gray-300" />
                                      )}
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {message.text && (
                            <div className="flex items-center justify-between gap-2">
                              <span>{message.text}</span>
                              {!message.image && (
                                <div className="flex items-center gap-1 text-[10px] opacity-70">
                                  <span>{formatMessageTime(message.createdAt)}</span>
                                  {isSender && (
                                    <>
                                      {!message.isDelivered ? (
                                        <Check className="w-4 h-4 text-gray-400" />
                                      ) : message.isSeen ? (
                                        <CheckCheck className="w-4 h-4 text-blue-400" />
                                      ) : (
                                        <CheckCheck className="w-4 h-4 text-gray-400" />
                                      )}
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {(message.image && message.text) && (
                            <div className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground mt-1">
                              <span>{formatMessageTime(message.createdAt)}</span>
                              {isSender && (
                                <>
                                  {!message.isDelivered ? (
                                    <Check className="w-4 h-4 text-gray-400" />
                                  ) : message.isSeen ? (
                                    <CheckCheck className="w-4 h-4 text-blue-400" />
                                  ) : (
                                    <CheckCheck className="w-4 h-4 text-gray-400" />
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </>
                      )}
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