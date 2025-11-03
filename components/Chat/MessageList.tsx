import React from "react";

interface MessageListProps {
  children: React.ReactNode;
}

export function MessageList({ children }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {children}
    </div>
  );
}