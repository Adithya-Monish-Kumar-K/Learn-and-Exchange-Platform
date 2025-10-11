import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, Search, Filter } from 'lucide-react';
import offerService from '../services/offerService';
import OfferCard from '../components/offers/OfferCard';

interface IOffer {
  _id?: string;
  task:
    | string
    | {
        _id: string;
        title: string;
        description?: string;
        category?: string;
        difficulty?: string;
        createdBy?: string;
      };
  offeredBy:
    | string
    | {
        _id: string;
        name: string;
        avatar?: string;
        bio?: string;
        rating?: number;
        level?: number;
        tasksCompleted?: number;
      };
  description: string;
  valueType: 'service' | 'skill' | 'asset' | 'other';
  valueDetail?: string;
  assets?: string[];
  status?: 'pending' | 'accepted' | 'declined' | 'withdrawn';
  acceptedBy?:
    | string
    | {
        _id: string;
        name: string;
        avatar?: string;
        rating?: number;
        level?: number;
      };
  acceptedAt?: Date | string;
  expiresAt?: Date | string;
  priority?: 'low' | 'medium' | 'high';
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

const Offers: React.FC = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<IOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [valueTypeFilter, setValueTypeFilter] = useState('all');

  useEffect(() => {
    fetchOffers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOffers = async () => {
    try {
      // Build query parameters
  const params: Record<string, string> = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (valueTypeFilter !== 'all') params.valueType = valueTypeFilter;
      if (searchTerm) params.search = searchTerm;

      const response = await offerService.getAllOffers(params);
      if (response.data) {
        setOffers(response.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching offers:', error);

      // Fallback to mock data if backend is not available
      const mockOffers: IOffer[] = [
        {
          _id: '1',
          task: 'Website Development',
          offeredBy: 'current-user-id',
          description:
            'I can help with frontend development using React and TypeScript. I have 5 years of experience and can deliver high-quality, responsive websites.',
          valueType: 'service',
          valueDetail: '$75/hour',
          assets: ['portfolio-link', 'github-profile'],
          status: 'pending',
          createdAt: new Date('2024-01-15'),
        },
        {
          _id: '2',
          task: 'Logo Design',
          offeredBy: 'user-2',
          description:
            'Professional logo design services with unlimited revisions. I specialize in modern, minimalist designs that capture your brand essence.',
          valueType: 'service',
          valueDetail: '$150 fixed price',
          assets: ['behance-portfolio'],
          status: 'accepted',
          createdAt: new Date('2024-01-12'),
        },
        {
          _id: '3',
          task: 'Content Writing',
          offeredBy: 'user-3',
          description:
            'I can write engaging blog posts, articles, and web content. Native English speaker with 3+ years of content marketing experience.',
          valueType: 'skill',
          valueDetail: '$0.10/word',
          assets: [],
          status: 'pending',
          createdAt: new Date('2024-01-10'),
        },
      ];

      setOffers(mockOffers);
      toast.error('Backend not available - using demo data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/offers/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) {
      return;
    }

    try {
      const response = await offerService.deleteOffer(id);
      setOffers((prev) => prev.filter((offer) => offer._id !== id));
      toast.success(response.message || 'Offer deleted successfully');
    } catch (error) {
      console.error('Error deleting offer:', error);
      toast.error('Failed to delete offer');
    }
  };

  const filteredOffers = offers.filter((offer) => {
    const matchesSearch =
      offer.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.valueType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || offer.status === statusFilter;
    const matchesValueType =
      valueTypeFilter === 'all' || offer.valueType === valueTypeFilter;

    return matchesSearch && matchesStatus && matchesValueType;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--info)', borderTopColor: 'transparent' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading offers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Offers</h1>
            <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
              Manage your offers and connect with tasks in the community.
            </p>
          </div>

          <button
            onClick={() => navigate('/offers/create')}
            className="px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            style={{ background: 'var(--info)', color: '#fff' }}
          >
            <Plus className="w-4 h-4" />
            <span>Create Offer</span>
          </button>
        </div>

        {/* Filters */}
        <div className="rounded-xl shadow-sm p-6 mb-8" style={{ background: 'var(--card-background)', border: '1px solid var(--card-border)' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search offers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 form-input"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 form-select"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <select
                value={valueTypeFilter}
                onChange={(e) => setValueTypeFilter(e.target.value)}
                className="w-full pl-10 pr-4 form-select"
              >
                <option value="all">All Types</option>
                <option value="service">Service</option>
                <option value="skill">Skill</option>
                <option value="asset">Asset</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Offers Grid */}
        {filteredOffers.length === 0 ? (
          <div className="rounded-xl shadow-sm p-12 text-center" style={{ background: 'var(--card-background)', border: '1px solid var(--card-border)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--input-background)' }}>
              <Plus className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
            </div>
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              No offers found
            </h3>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              {searchTerm || statusFilter !== 'all' || valueTypeFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first offer'}
            </p>
            <button
              onClick={() => navigate('/offers/create')}
              className="px-6 py-2 rounded-lg transition-colors"
              style={{ background: 'var(--info)', color: '#fff' }}
            >
              Create First Offer
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map((offer) => (
              <OfferCard
                key={offer._id}
                offer={offer}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Offers;
