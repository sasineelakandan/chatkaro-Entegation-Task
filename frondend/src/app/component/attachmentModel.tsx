// AttachmentModal.tsx
import React from 'react';

interface Props {
  onClose: () => void;
  onSelect: (type: 'image' | 'document' | 'video' | 'audio') => void;
}

const AttachmentModal: React.FC<Props> = ({ onClose, onSelect }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Send File</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            &times;
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { type: 'image', label: 'Photo', bg: 'bg-blue-100', color: 'text-blue-500' },
            { type: 'document', label: 'Document', bg: 'bg-green-100', color: 'text-green-500' },
            { type: 'video', label: 'Video', bg: 'bg-purple-100', color: 'text-purple-500' },
            { type: 'audio', label: 'Audio', bg: 'bg-orange-100', color: 'text-orange-500' },
          ].map(({ type, label, bg, color }) => (
            <button
              key={type}
              onClick={() => onSelect(type as Props['onSelect'] extends (t: infer U) => void ? U : never)}
              className="flex flex-col items-center p-4 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className={`w-12 h-12 ${bg} rounded-full flex items-center justify-center mb-2`}>
                <div className={`w-6 h-6 ${color}`}>
                  {/* You can replace this with actual icons if needed */}
                  📎
                </div>
              </div>
              <span className="text-sm">{label}</span>
            </button>
          ))}
        </div>
      </div>
      
    </div>
    
  );
};

export default AttachmentModal;
