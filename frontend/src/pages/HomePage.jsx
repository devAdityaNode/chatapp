import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import ConfirmBar from "../components/ConfirmBar";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  const { authUser } = useAuthStore();
  const { selectedUser } = useChatStore();

  const containerRef = useRef(null);
  const resizerRef = useRef(null);
  const [sidebarWidth, setSidebarWidth] = useState(360);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !containerRef.current) return;

      const newWidth = e.clientX;
      const minWidth = 280;
      const maxWidth = 400;
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setSidebarWidth(newWidth);
      }
    };

    const stopDragging = () => setIsDragging(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopDragging);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopDragging);
    };
  }, [isDragging]);

  if (!authUser) {
    return (
      <div className="min-h-screen bg-base-100 flex flex-col">
        <div className="flex-grow flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-primary">
            Welcome to ChatVerse
          </h1>
          <p className="text-lg md:text-xl text-base-content/80 max-w-xl mb-8">
            Connect with friends, chat in real-time, and experience seamless communication.
          </p>
          <Link to="/signup" className="btn btn-lg btn-secondary rounded-full px-8">
            Get Started
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen flex bg-base-200 overflow-hidden" ref={containerRef}>
      <ConfirmBar />

      {(!isMobile || !selectedUser) && (
        <div
          className="bg-[#1e1e1e] transition-all duration-150 ease-in-out"
          style={!isMobile ? { width: sidebarWidth } : { width: "100%" }}
        >
          <Sidebar />
        </div>
      )}

      {!isMobile && (
        <div
          ref={resizerRef}
          onMouseDown={() => setIsDragging(true)}
          className="w-1 cursor-col-resize bg-black/10 hover:bg-black/20 transition"
          style={{ boxShadow: "0 0 6px rgba(0, 0, 0, 0.4)" }}
        />
      )}

      {(!isMobile || selectedUser) && (
        <div className="flex-1 h-full flex flex-col">
          {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
        </div>
      )}
    </div>
  );
};

export default HomePage;