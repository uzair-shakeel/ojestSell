"use client";

export default function RecentChats({ chats = [] }) {
  const items = Array.isArray(chats) ? chats.slice(-6) : [];

  return (
    <div className="p-4 bg-white shadow rounded-xl ring-1 ring-black/5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Recent chats</h3>
      </div>
      <div className="grid gap-3">
        {items.length === 0 && (
          <div className="text-sm text-gray-500">No chats yet</div>
        )}
        {items.map((chat) => {
          const other = Array.isArray(chat.participants)
            ? chat.participants.find((p) => p?.id && p?.email)
            : null;
          const name = other
            ? `${other.firstName || ""} ${other.lastName || ""}`.trim() ||
              other.email
            : "Unknown";
          const avatar = other?.image || "/images/default-seller.png";
          const preview = chat?.lastMessage?.text || "No messages yet";
          const time = new Date(
            chat?.updatedAt || chat?.lastMessage?.timestamp || Date.now()
          ).toLocaleString();
          return (
            <div
              key={chat?._id || chat?.id || time}
              className="flex items-center gap-3"
            >
              <img
                src={avatar}
                alt={name}
                className="w-10 h-10 rounded-full object-cover ring-1 ring-black/5"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-gray-900">{name}</div>
                <div className="text-xs text-gray-500 truncate">{preview}</div>
              </div>
              <div className="text-xs text-gray-400 whitespace-nowrap">
                {time}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

