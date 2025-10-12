import { Types } from "mongoose";

export interface IMessage {
  senderId: string;      
  text: string;
  timestamp: Date;
}
export interface IChat {
  participants: string[]; 
  listingId: string;     
  offerId: string;       
  messages: IMessage[];
  lastUpdated: Date;
  title: string;
  status: 'pending' | 'accepted' | 'rejected';
}