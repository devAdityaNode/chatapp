import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Image, Send, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const {
    sendMessage,
    isSelecting,
    selectedMessageIds,
    setIsSelecting,
    setConfirmAction,
    messages,
  } = useChatStore();

  const { authUser } = useAuthStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file?.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({ text: text.trim(), image: imagePreview });
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (isSelecting) {
    return (
      <div className="p-3 border-t border-base-300 bg-base-100 flex justify-between items-center gap-2">
        <div className="text-sm opacity-80">{selectedMessageIds.length} selected</div>
        <div className="flex gap-2">
          <button
            className={`btn btn-sm ${selectedMessageIds.length > 0 ? "btn-error" : "btn-ghost opacity-50"}`}
            onClick={() => {
              if (selectedMessageIds.length > 0) {
                setConfirmAction("deleteMessages", selectedMessageIds, "message");
              } else {
                toast.error("Select a message first");
              }
            }}
          >
            <Trash2 size={16} />
            Delete
          </button>

          <button
            className="btn btn-sm"
            onClick={() => setIsSelecting(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSendMessage}
      className="p-3 border-t border-base-300 flex flex-col gap-2 bg-base-100"
    >
      {imagePreview && (
        <div className="flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-md"
            />
            <button
              onClick={removeImage}
              type="button"
              className="absolute -top-1.5 -right-1.5 bg-base-300 p-0.5 rounded-full"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="text"
          className="input input-bordered w-full rounded-full"
          placeholder="Type your message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="btn btn-circle btn-ghost"
        >
          <Image size={20} />
        </button>
        <button
          type="submit"
          className="btn btn-circle btn-primary"
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={20} />
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
