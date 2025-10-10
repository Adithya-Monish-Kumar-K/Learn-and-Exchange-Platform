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
