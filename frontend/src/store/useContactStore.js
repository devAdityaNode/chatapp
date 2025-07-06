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