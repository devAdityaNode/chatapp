import dayjs from "dayjs";

export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export const formatChatDate = (date) => {
  const today = dayjs().format("YYYY-MM-DD");
  const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");

  if (date === today) return "Today";
  if (date === yesterday) return "Yesterday";
  return dayjs(date).format("DD MMM YYYY");
};

