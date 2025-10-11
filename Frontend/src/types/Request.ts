export interface Request {
  _id: string;
  title: string;
  description: string;
  task?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  senderId: string;
  receiverId: string;
  participants?: {
    _id: string;
    name: string;
    email: string;
  }[];
}
