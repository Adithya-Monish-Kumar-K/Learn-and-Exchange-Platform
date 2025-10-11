import cloudinary from '../config/cloudinary';
import Message from '../models/Message.model';
import User from '../models/User.model';
import Asset from '../models/Asset.model';
import { getReceiverSocketId, io } from '../config/socket';
import { Request, Response } from 'express';
import { Types } from 'mongoose';

export const getUsersForSidebar = async (req: any, res: any) => {
  try {
    const loggedInUserId = req.user._id;

    const chats = await Message.find({
      participants: loggedInUserId,
    })
      .populate({
        path: 'participants',
        select: 'name email profileImage',
      })
      .sort({ updatedAt: -1 });

  const sidebar = chats.map((chat: any) => {
      const otherParticipants = (chat.participants as any[]).filter(
        (p: any) => p._id.toString() !== loggedInUserId.toString()
      );
      return {
        chatId: chat._id,
        type: chat.type,
        participants: otherParticipants,
        lastMessage:
          chat.messages && chat.messages.length
            ? chat.messages[chat.messages.length - 1]
            : null,
        updatedAt: (chat as any).updatedAt,
      };
    });

    res.status(200).json(sidebar);
  } catch (error: any) {
    console.log('Error in getUsersForSidebar Controller: ', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getMessages = async (req: any, res: any) => {
  try {
    const paramId = req.params.id;
    const myId = req.user._id as string;

    let chat;

    if (Types.ObjectId.isValid(paramId)) {
      chat = await Message.findById(paramId).populate({
        path: 'messages.senderId participants messages.media',
        select: 'name email profileImage',
      });
    }

    if (!chat) {
      const otherUserId = paramId;
      if (!Types.ObjectId.isValid(otherUserId)) {
        return res.status(400).json({ message: 'Invalid id' });
      }
      chat = await Message.findOne({
        type: 'private',
        participants: { $all: [myId, otherUserId] },
      }).populate({
        path: 'messages.senderId participants messages.media',
        select: 'name email profileImage',
      });
    }

    if (!chat) {
      return res.status(200).json({ messages: [] });
    }

    res.status(200).json(chat);
  } catch (error: any) {
    console.log('Error in getMessages Controller: ', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const sendMessage = async (req: any, res: any) => {
  try {
    const { type = 'private', text, image } = req.body;
    const paramId = req.params.id;
    const senderId = req.user._id as string;

    const mediaIds: Types.ObjectId[] = [];

    if (Array.isArray(image) && image.length > 0) {
      for (const img of image) {
        const uploadResponse = await cloudinary.uploader.upload(img);
        const asset = await Asset.create({
          url: uploadResponse.secure_url,
          publicId: uploadResponse.public_id,
          resourceType: uploadResponse.resource_type,
          uploadedBy: senderId,
        });
        mediaIds.push(asset._id as Types.ObjectId);
      }
    }

    const newMessage = {
      senderId: senderId,
      text: text || '',
      type: mediaIds.length > 0 ? 'image' : text ? 'text' : 'text',
      readBy: [senderId],
      isEdited: false,
      media: mediaIds,
    };

    let updatedChat: any = null;

    if (Types.ObjectId.isValid(paramId)) {
      const chatById = await Message.findById(paramId);
      if (chatById) {
        updatedChat = await Message.findByIdAndUpdate(
          paramId,
          { $push: { messages: newMessage } },
          { new: true }
        );
      } else {
        const otherUserId = paramId;
        const existingChat = await Message.findOne({
          type: 'private',
          participants: { $all: [senderId, otherUserId] },
        });
        if (existingChat) {
          updatedChat = await Message.findOneAndUpdate(
            { _id: existingChat._id },
            { $push: { messages: newMessage } },
            { new: true }
          );
        } else {
          const newChat = new Message({
            type: 'private',
            participants: [senderId, otherUserId],
            messages: [newMessage],
          });
          updatedChat = await newChat.save();
        }
      }
    } else {
      console.log(paramId);
      return res.status(400).json({ message: 'Invalid id' });
    }

    const receivers = (updatedChat.participants as any[])
      .map((p: any) => p.toString())
      .filter((id) => id !== senderId);
    for (const rId of receivers) {
      const sockets = getReceiverSocketId(rId);
      if (sockets && sockets.length) {
        for (const socketId of sockets) {
          io.to(socketId).emit('newMessage', {
            chatId: updatedChat._id,
            message: newMessage,
          });
        }
      }
    }

    res.status(201).json(updatedChat);
  } catch (error: any) {
    console.log('Error in sendMessages Controller: ', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const editMessage = async (req: any, res: any) => {
  try {
    const { chatId, messageId } = req.params;
    const { text } = req.body;
    const userId = req.user._id as string;

    if (!Types.ObjectId.isValid(chatId) || !Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    // Only allow sender to edit their message
    const updated = await Message.findOneAndUpdate(
      { _id: chatId, 'messages._id': messageId, 'messages.senderId': userId },
      {
        $set: {
          'messages.$.text': text || '',
          'messages.$.isEdited': true,
        },
      },
      { new: true }
    ).populate({
      path: 'participants messages.senderId messages.media',
      select: 'name email profileImage',
    });

    if (!updated) {
      return res
        .status(404)
        .json({ message: 'Message not found or not authorized' });
    }

    // notify participants about edit
    const receivers = (updated.participants as any[])
      .map((p: any) => p.toString())
      .filter((id) => id !== userId);
    for (const rId of receivers) {
      const sockets = getReceiverSocketId(rId);
      if (sockets && sockets.length) {
        for (const socketId of sockets) {
          io.to(socketId).emit('editMessage', {
            chatId: updated._id,
            messageId,
            text,
          });
        }
      }
    }

    res.status(200).json({ chat: updated, messageId });
  } catch (error: any) {
    console.log('Error in editMessage Controller: ', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const deleteMessage = async (req: any, res: any) => {
  try {
    const { chatId, messageId } = req.params;
    const userId = req.user._id as string;

    if (!Types.ObjectId.isValid(chatId) || !Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    const chat = await Message.findById(chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    const msg = (chat.messages as any[]).find(
      (m: any) => m._id.toString() === messageId
    );
    if (!msg) return res.status(404).json({ message: 'Message not found' });

    if (msg.senderId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: 'Not authorized to delete this message' });
    }

    // remove message
    await Message.findByIdAndUpdate(
      chatId,
      { $pull: { messages: { _id: messageId } } },
      { new: true }
    );
    // optionally delete linked assets
    if (msg.media && Array.isArray(msg.media) && msg.media.length) {
      try {
        await Asset.deleteMany({ _id: { $in: msg.media } });
      } catch (err) {
        console.warn('Failed to remove linked assets:', err);
      }
    }

    // notify participants
    const receivers = (chat.participants as any[])
      .map((p: any) => p.toString())
      .filter((id) => id !== userId);
    for (const rId of receivers) {
      const sockets = getReceiverSocketId(rId);
      if (sockets && sockets.length) {
        for (const socketId of sockets) {
          io.to(socketId).emit('deleteMessage', { chatId, messageId });
        }
      }
    }

    res.status(200).json({ message: 'Deleted' });
  } catch (error: any) {
    console.log('Error in deleteMessage Controller: ', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const searchChats = async (req: any, res: any) => {
  try {
    const q = (req.query.q as string) || '';
    const userId = req.user._id as string;
    if (!q) return res.status(200).json([]);

    const regex = new RegExp(q, 'i');

    const matchedUsers = await User.find({ name: regex }).select('_id');
    const userIds = matchedUsers.map((u: any) => u._id);

    const chats = await Message.find({
      participants: userId,
      $or: [{ participants: { $in: userIds } }, { 'messages.text': regex }],
    })
      .populate({ path: 'participants', select: 'name email profileImage' })
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (error: any) {
    console.log('Error in searchChats Controller: ', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const searchMessages = async (req: any, res: any) => {
  try {
    const { id: chatId } = req.params;
    const q = (req.query.q as string) || '';
    const userId = req.user._id as string;

    if (!Types.ObjectId.isValid(chatId))
      return res.status(400).json({ message: 'Invalid chat id' });
    if (!q) return res.status(200).json({ messages: [] });

    const regex = new RegExp(q, 'i');

    const chat = await Message.findOne({
      _id: chatId,
      participants: userId,
    }).populate({
      path: 'messages.senderId messages.media',
      select: 'name profileImage',
    });
    if (!chat)
      return res
        .status(404)
        .json({ message: 'Chat not found or access denied' });

    const matched = (chat.messages as any[]).filter(
      (m) => typeof m.text === 'string' && regex.test(m.text)
    );
    res.status(200).json({ messages: matched });
  } catch (error: any) {
    console.log('Error in searchMessages Controller: ', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getChatRequests = async (req: any, res: any) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const userId: string = (user._id as Types.ObjectId).toString();

    const chats = await Message.find({
      participants: userId,
      type: 'request',
    })
      .populate({
        path: 'participants',
        select: 'name email profileImage',
      })
      .sort({ updatedAt: -1 });

    const requests = chats.map((chat: any) => {
      const otherParticipant = chat.participants.find(
        (p: any) => p._id.toString() !== userId.toString()
      );
      return {
        _id: chat._id,
        title: chat.title || 'Chat Request',
        description: chat.messages.length > 0 ? chat.messages[0].text : '',
        status: chat.status || 'pending',
        createdAt: chat.createdAt,
        userId: otherParticipant?._id,
        senderId: chat.senderId,
        receiverId: chat.receiverId
      };
    });

    res.status(200).json(requests);
  } catch (error: any) {
    console.log('Error in getChatRequests Controller: ', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const addRequest = async (req: any, res: any) => {
  try {
    console.log('Request Body:', req.body);
    const { receiverId, title, description, senderId } = req.body;
    if (!receiverId)
      return res.status(400).json({ message: 'Receiver is required' });
    if (!title) return res.status(400).json({ message: 'Title is required' });
    if (!description)
      return res.status(400).json({ message: 'Description is required' });
    if (receiverId === senderId)
      return res
        .status(400)
        .json({ message: 'Cannot send request to yourself' });

    let chat = await Message.findOne({
      type: 'request',
      participants: { $all: [senderId, receiverId] },
    });
    if (chat) {
      return res.status(400).json({ message: 'Request chat already exists' });
    }
    const newChat = new Message({
      type: 'request',
      participants: [senderId, receiverId],
      title,
      status: 'pending',
      senderId,
      receiverId,
      messages: [
        {
          senderId,
          text: description,
          createdAt: new Date(),
        },
      ],
    });
    await newChat.save();
    res.status(201).json({ message: 'Chat request sent successfully' });
  } catch (error: any) {
    console.log('Error in addRequest Controller: ', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const respondToRequest = async (req: any, res: any) => {
  try {
    const { chatId } = req.params;
    const { action, userId } = req.body; // 'accept' or 'reject'

    console.log('Respond to Request - chatId:', chatId, 'action:', action, 'userId:', userId);
    
    if (!Types.ObjectId.isValid(chatId))
      return res.status(400).json({ message: 'Invalid chat id' });
    const chat = await Message.findById(chatId);
    if (!chat)
      return res.status(404).json({ message: 'Chat request not found' });
    if (chat.type !== 'request')
      return res.status(400).json({ message: 'Not a request chat' });
    if (chat.status !== 'pending')
      return res.status(400).json({ message: 'Request already responded' });
    chat.status = action ? 'accepted' : 'rejected';
    await chat.save();

    const otherParticipantId = chat.participants
      .map((p: any) => p.toString())
      .find((id: any) => id !== userId);
    if (otherParticipantId) {
      const sockets = getReceiverSocketId(otherParticipantId);
      if (sockets && sockets.length) {
        for (const socketId of sockets) {
          io.to(socketId).emit('requestResponse', {
            chatId: chat._id,
            status: chat.status,
          });
        }
      }
    }

    res.status(200).json({ message: `Request ${chat.status}` });
  } catch (error: any) {
    console.log('Error in respondToRequest Controller: ', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const editRequest = async (req: any, res: any) => {
  try {
    const { id: chatId } = req.params;
    const { title, description } = req.body;

    if (!Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: 'Invalid chat ID' });
    }

    const chat = await Message.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat request not found' });
    }

    if (chat.type !== 'request') {
      return res.status(400).json({ message: 'Not a chat request' });
    }

    if (chat.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot edit processed request' });
    }

    chat.title = title;
    if (chat.messages && chat.messages.length > 0) {
      chat.messages[0].text = description;
      chat.messages[0].isEdited = true;
    }

    await chat.save();

    // Notify the receiver about the edit
    const receiverId = chat.participants[1].toString();
    const sockets = getReceiverSocketId(receiverId);
    if (sockets && sockets.length) {
      for (const socketId of sockets) {
        io.to(socketId).emit('requestEdit', {
          chatId: chat._id,
          title,
          description,
        });
      }
    }

    res.status(200).json({ message: 'Request updated successfully', chat });
  } catch (error: any) {
    console.log('Error in editRequest Controller: ', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const deleteRequest = async (req: any, res: any) => {
  try {
    const { id: chatId } = req.params;

    if (!Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: 'Invalid chat ID' });
    }

    const chat = await Message.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat request not found' });
    }

    if (chat.type !== 'request') {
      return res.status(400).json({ message: 'Not a chat request' });
    }

    if (chat.status !== 'pending') {
      return res
        .status(400)
        .json({ message: 'Cannot delete processed request' });
    }

    await Message.findByIdAndDelete(chatId);

    // Notify the receiver about the deletion
    const receiverId = chat.participants[1].toString();
    const sockets = getReceiverSocketId(receiverId);
    if (sockets && sockets.length) {
      for (const socketId of sockets) {
        io.to(socketId).emit('requestDelete', {
          chatId: chat._id,
        });
      }
    }

    res.status(200).json({ message: 'Request deleted successfully' });
  } catch (error: any) {
    console.log('Error in deleteRequest Controller: ', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
