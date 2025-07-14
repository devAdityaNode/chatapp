import { MessageCircle } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 relative bg-base-100 overflow-hidden">

      <div className="absolute -z-10 w-[400px] h-[400px] bg-primary opacity-20 blur-3xl rounded-full top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2" />

      <div className="mb-6 p-4 bg-primary/10 rounded-2xl shadow-lg flex items-center justify-center animate-bounce">
        <MessageCircle className="w-10 h-10 text-primary" />
      </div>

      <h1 className="text-3xl font-bold text-white mb-2">
        No Chat Selected
      </h1>

      <p className="text-gray-400 max-w-md mb-6">
        Pick a friend from the sidebar and start a conversation. Real-time, private, and smooth chatting experience — only on ChatVerse.
      </p>

      <div className="space-y-3 w-full max-w-xs text-left">
        <div className="bg-gray-700 text-white py-2 px-4 rounded-xl w-2/3">
          👋 Hey! Ready to chat?
        </div>
        <div className="bg-primary text-white py-2 px-4 rounded-xl self-end ml-auto w-1/2">
          Yup! Let’s go 🚀
        </div>
        <div className="bg-gray-700 text-white py-2 px-4 rounded-xl w-1/2">
          Cool 😄
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;
