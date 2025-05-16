export type User = {
    _id: string;
    username: string;
    email: string;
    avatar: string;
    isOnline: boolean;
    lastMessage?: string;
    time?: string;
    unread?: number;
    chatRoomId?: string;
  };
  
  export type Message = {
    _id: string;
    chatRoom: string;
    sender: string;
    messageType: "text" | "image" | "video" | "file";
    content: string;
    seenBy: string[];
    deliveredTo: string[];
    deletedFor: string[];
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  
  export type SignUpFormInputs = {
    email: string;
    username: string;
    password: string;
    image: FileList;  
  };

  export type LoginFormInputs = {
    email: string;
    password: string;
  };