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

export function formatTime(date) {
  const inputDate = dayjs(date);
  const now = dayjs();

  if (inputDate.isSame(now, "day")) {
    return inputDate.format("HH:mm");
  }

  if (inputDate.isSame(now.subtract(1, "day"), "day")) {
    return "Yesterday";
  }

  if (inputDate.isSame(now, "year")) {
    return inputDate.format("DD MMM");
  }

  return inputDate.format("DD MMM YYYY");
}