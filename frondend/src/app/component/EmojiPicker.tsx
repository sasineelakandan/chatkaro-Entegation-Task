'use client';
import { useState } from 'react';

const emojis = ['😀', '😂', '😍', '👍', '❤️', '🔥', '🙏', '🎉', '🤔', '😎'];

export const EmojiPicker = ({ onSelect }: { onSelect: (emoji: string) => void }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-2 grid grid-cols-5 gap-2">
      {emojis.map((emoji) => (
        <button
          key={emoji}
          className="text-2xl hover:bg-gray-100 rounded p-2"
          onClick={() => onSelect(emoji)}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};