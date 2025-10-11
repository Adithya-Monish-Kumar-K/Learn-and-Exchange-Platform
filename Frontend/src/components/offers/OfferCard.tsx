import React from 'react';
import { Edit, Trash2, Clock, User, Tag } from 'lucide-react';
interface IOffer {
  _id?: string;
  task: string | {
    _id: string;
    title: string;
    description?: string;
    category?: string;
    difficulty?: string;
    createdBy?: string;
  };
  offeredBy: string | {
    _id: string;
    name: string;
    avatar?: string;
    bio?: string;
    rating?: number;
    level?: number;
    tasksCompleted?: number;
  };
  description: string;
  valueType: "service" | "skill" | "asset" | "other";
  valueDetail?: string;
  assets?: string[];
  status?: "pending" | "accepted" | "declined" | "withdrawn";
  acceptedBy?: string | {
    _id: string;
    name: string;
    avatar?: string;
    rating?: number;
    level?: number;
  };
  acceptedAt?: Date | string;
  expiresAt?: Date | string;
  priority?: "low" | "medium" | "high";
  estimatedDelivery?: Date | string;
  terms?: string;
  attachments?: Array<{
    filename: string;
    url: string;
    fileType: string;
    uploadedAt: Date | string;
  }>;
  feedback?: {
    rating?: number;
    comment?: string;
    givenBy?: string;
    givenAt?: Date | string;
  };
  isActive?: boolean;
  viewCount?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

interface OfferCardProps {
  offer: IOffer;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const OfferCard: React.FC<OfferCardProps> = ({ offer, onEdit, onDelete }) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getValueTypeColor = (valueType: string) => {
    switch (valueType) {
      case 'service':
        return 'bg-blue-100 text-blue-800';
      case 'skill':
        return 'bg-green-100 text-green-800';
      case 'asset':
        return 'bg-orange-100 text-orange-800';
      case 'other':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(offer.status)}`}>
              {offer.status || 'pending'}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getValueTypeColor(offer.valueType)}`}>
              {offer.valueType}
            </span>
          </div>
          
          <p className="text-gray-900 text-sm leading-relaxed mb-3">{offer.description}</p>
          
          {offer.valueDetail && (
            <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
              <Tag className="w-4 h-4" />
              <span>{offer.valueDetail}</span>
            </div>
          )}

          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3" />
              <span>Task: {typeof offer.task === 'string' ? offer.task : 'Unknown'}</span>
            </div>
            {offer.createdAt && (
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{new Date(offer.createdAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-2 ml-4">
          <button
            onClick={() => onEdit(offer._id!)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit offer"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(offer._id!)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete offer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {offer.assets && offer.assets.length > 0 && (
        <div className="border-t border-gray-100 pt-3">
          <p className="text-xs text-gray-600 mb-1">Assets:</p>
          <div className="flex flex-wrap gap-1">
            {offer.assets.map((asset, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
              >
                {asset}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferCard;