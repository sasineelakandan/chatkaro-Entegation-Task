// models/ChatRoom.ts
import mongoose, { Document, Schema } from 'mongoose';

interface IChatRoom extends Document {
  participants: mongoose.Types.ObjectId[];
  lastMessage?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ChatRoomSchema = new Schema<IChatRoom>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);


ChatRoomSchema.pre<IChatRoom>('save', function (next) {
  if (this.participants.length !== 2) {
    return next(new Error('A one-to-one chat room must have exactly 2 participants.'));
  }
  next();
});

const ChatRoom = mongoose.model<IChatRoom>('ChatRoom', ChatRoomSchema);
export default ChatRoom;
