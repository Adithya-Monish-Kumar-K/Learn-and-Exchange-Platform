export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  isEdited?: boolean;
}
