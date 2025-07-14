import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useContactStore = create((set, get) => ({
  users: [],
  isUsersLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/contacts/users");
      set({ users: res.data.contacts });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  setUsers: (updatedUsers) => set({ users: updatedUsers }),

  updateUserInSidebar: async (update, moveToTop = true) => {
    const { users } = get();
    const index = users.findIndex((u) => u._id === update.senderId);

    let updatedUser;

    if (index === -1) {
      try {
        const res = await axiosInstance.get(`/contacts/${update.senderId}`);
        const contact = res.data;

        updatedUser = {
          _id: update.senderId,
          userName: contact.userName,
          profilePic: contact.profilePic,
          latestMessage: update.latestMessage ?? "",
          latestMessageType: update.latestMessageType ?? "text",
          latestMessageTime: update.latestMessageTime ?? new Date(),
          unreadCount: update.unreadCount ?? 0,
          latestMessageSenderId: update.latestMessageSenderId ?? "",
          isDelivered: update.isDelivered ?? false,
          isSeen: update.isSeen ?? false,
        };

        const newUsers = [...users, updatedUser];
        newUsers.sort((a, b) => new Date(b.latestMessageTime) - new Date(a.latestMessageTime));

        set({ users: newUsers });
      } catch (err) {
        console.error("Failed to fetch user data for sidebar:", err.message);
      }

      return;
    }

    const user = users[index];
    updatedUser = {
      ...user,
      latestMessage: update.latestMessage ?? user.latestMessage,
      latestMessageType: update.latestMessageType ?? user.latestMessageType,
      latestMessageTime: update.latestMessageTime ?? user.latestMessageTime,
      unreadCount: update.unreadCount ?? user.unreadCount,
      latestMessageSenderId: update.latestMessageSenderId ?? user.latestMessageSenderId,
      isDelivered: update.isDelivered ?? user.isDelivered,
      isSeen: update.isSeen ?? user.isSeen,
    };

    const usersWithout = users.filter((u) => u._id !== update.senderId);
    const updatedUsers = [...usersWithout, updatedUser];
    updatedUsers.sort((a, b) => new Date(b.latestMessageTime) - new Date(a.latestMessageTime));

    set({ users: updatedUsers });
  },

  searchUsers: async (query) => {
    try {
      const res = await axiosInstance.get(`/contacts/search?query=${query}`);
      return res.data;
    } catch (error) {
      toast.error(error.response.data.message);
      return [];
    }
  },

  deleteContact: async (contactUserId) => {
    try {
      await axiosInstance.delete(`/contacts/delete-contact/${contactUserId}`);
      set((state) => ({
        users: state.users.filter((u) => u._id !== contactUserId),
      }));
      if (get().selectedUser?._id === contactUserId) {
        get().setSelectedUser(null);
      }
    } catch (err) {
      console.error("Error deleting contact user:", err.response?.data || err.message);
    }
  },
}))