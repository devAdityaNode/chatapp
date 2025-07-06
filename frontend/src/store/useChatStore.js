import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  selectedUser: null,
  isMessagesLoading: false,
  isSelecting: false,
  selectedMessageIds: [],
  confirmAction: null,
  confirmData: null,
  confirmType: null,

  setSelectedUser: (selectedUser) => set({ selectedUser }),

  setIsSelecting: (value) =>
    set({ isSelecting: value, selectedMessageIds: [] }),

  toggleSelectedMessage: (id) => {
    const { selectedMessageIds } = get();
    if (selectedMessageIds.includes(id)) {
      set({
        selectedMessageIds: selectedMessageIds.filter((m) => m !== id),
      });
    } else {
      set({
        selectedMessageIds: [...selectedMessageIds, id],
      });
    }
  },

  setConfirmAction: (action, data, type) =>
    set({
      confirmAction: action,
      confirmData: data,
      confirmType: type,
    }),

  clearConfirm: () =>
    set({
      confirmAction: null,
      confirmData: null,
      confirmType: null,
    }),

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  deleteMessages: async (type) => {
    const { selectedMessageIds, messages } = get();
    const { authUser } = useAuthStore.getState();
    try {
      await axiosInstance.delete(
        `/messages/${selectedMessageIds.join(",")}?type=${type}`
      );

      set({
        messages: messages.map((msg) => {
          if (selectedMessageIds.includes(msg._id)) {
            if (type === "everyone") {
              return { ...msg, text: "", image: "", isDeleted: true };
            }
            if (type === "me") {
              return {
                ...msg,
                deletedBy: [...msg.deletedBy, authUser._id],
              };
            }
          }
          return msg;
        }),
        isSelecting: false,
        selectedMessageIds: [],
      });

      get().clearConfirm();
    } catch (err) {
      toast.error("Delete failed");
    }
  },

  clearChat: async (contactUserId) => {
    const { authUser } = useAuthStore.getState();
    try {
      await axiosInstance.delete(`/messages/clear-chat/${contactUserId}`);

      set((state) => ({
        messages: state.messages.filter(
          (msg) =>
            !(
              (msg.senderId === contactUserId ||
                msg.receiverId === contactUserId) &&
              !msg.deletedBy.includes(authUser._id)
            )
        ),
      }));

      get().clearConfirm();
    } catch (err) {
      toast.error("Clear chat failed");
    }
  },

  deleteContact: async (contactUserId) => {
    try {
      await axiosInstance.delete(`/contacts/delete-contact/${contactUserId}`);
      set({ selectedUser: null });
      get().clearConfirm();
    } catch (err) {
      toast.error("Delete contact failed");
    }
  },
}));