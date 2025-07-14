import { X } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useContactStore } from "../store/useContactStore";

const ConfirmBar = () => {
  const {
    confirmAction,
    confirmData,
    confirmType,
    setConfirmAction,
    deleteMessages,
    clearChat,
  } = useChatStore();
  const { deleteContact } = useContactStore();
  const { authUser } = useAuthStore();

  if (!confirmAction) return null;

  const allCanDeleteForEveryone =
    confirmType === "message" &&
    confirmData.every((id) => {
      const msg = useChatStore.getState().messages.find((m) => m._id === id);
      return (
        msg && !msg.isDeleted && msg.senderId === authUser._id && !msg.isSeen
      );
    });

  const handleConfirm = async (type) => {
    if (confirmType === "message") {
      await deleteMessages(type);
    } else if (confirmType === "chat") {
      await clearChat(confirmData[0]);
    } else if (confirmType === "contact") {
      await deleteContact(confirmData[0]);
      useChatStore.getState().setSelectedUser(null);
    }

    setConfirmAction(null, null, null);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg shadow-lg p-6 w-full max-w-sm relative">
        <X
          className="absolute top-2 right-2 cursor-pointer text-gray-500 hover:text-gray-700"
          onClick={() => setConfirmAction(null, null, null)}
        />
        <h2 className="text-lg font-semibold mb-4">
          {confirmType === "message" && "Delete message?"}
          {confirmType === "chat" && "Clear chat?"}
          {confirmType === "contact" && "Delete contact?"}
        </h2>

        <div className="flex flex-col gap-3">
          {confirmType === "message" && allCanDeleteForEveryone && (
            <button
              className="btn btn-outline btn-error"
              onClick={() => handleConfirm("everyone")}
            >
              Delete for everyone
            </button>
          )}

          {confirmType === "message" && (
            <button
              className="btn btn-outline btn-warning"
              onClick={() => handleConfirm("me")}
            >
              Delete for me
            </button>
          )}

          {confirmType !== "message" && (
            <button
              className="btn btn-outline btn-error"
              onClick={() => handleConfirm()}
            >
              Confirm
            </button>
          )}

          <button
            className="btn"
            onClick={() => setConfirmAction(null, null, null)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmBar;
