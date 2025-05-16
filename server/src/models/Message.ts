// models/Message.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    chatRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatRoom',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'video','document', 'audio', 'file', 'emoji'],
      default: 'text',
    },
    content: {
      type: String,
      required: true,
    },
    fileName: String,
    
    
    seenBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    deliveredTo: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    deletedFor: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  {
    timestamps: true, 
  }
);

export default mongoose.model('Message', MessageSchema);
