import React from "react";
import { Id } from "convex/_generated/dataModel";

interface MessageProps {
  author: Id<"users">;
  authorName?: string;
  viewer: Id<"users">;
  children: React.ReactNode;
}

export function Message({ author, authorName, viewer, children }: MessageProps) {
  const isOwn = author === viewer;

  return (
    <div
      className={`flex gap-3 p-3 ${
        isOwn ? "flex-row-reverse" : "flex-row"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex-shrink-0 ${
          isOwn ? "bg-blue-500" : "bg-gray-400"
        }`}
      />
      <div
        className={`max-w-xs lg:max-w-md ${
          isOwn ? "text-right" : "text-left"
        }`}
      >
        {authorName && (
          <div
            className={`text-xs font-medium mb-1 ${
              isOwn ? "text-blue-600" : "text-gray-600"
            }`}
          >
            {authorName}
          </div>
        )}
        <div
          className={`inline-block px-4 py-2 rounded-lg ${
            isOwn
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-900"
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}