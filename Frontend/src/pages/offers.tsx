import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, Search, Filter } from 'lucide-react';
import { IOffer } from '../types';
import { offersAPI } from '../services/api';
import OfferCard from '../components/Offers/OfferCard';

const Offers: React.FC = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<IOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [valueTypeFilter, setValueTypeFilter] = useState('all');

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      // Build query parameters
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (valueTypeFilter !== 'all') params.valueType = valueTypeFilter;
      if (searchTerm) params.search = searchTerm;
      
      const response = await offersAPI.getAll(params);
      if (response.data && response.data.data) {
        setOffers(response.data.data);
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
          description: 'I can help with frontend development using React and TypeScript. I have 5 years of experience and can deliver high-quality, responsive websites.',
          valueType: 'service',
          valueDetail: '$75/hour',
          assets: ['portfolio-link', 'github-profile'],
          status: 'pending',
          createdAt: new Date('2024-01-15')
        },
        {
          _id: '2',
          task: 'Logo Design',
          offeredBy: 'user-2',
          description: 'Professional logo design services with unlimited revisions. I specialize in modern, minimalist designs that capture your brand essence.',
          valueType: 'service',
          valueDetail: '$150 fixed price',
          assets: ['behance-portfolio'],
          status: 'accepted',
          createdAt: new Date('2024-01-12')
        },
        {
          _id: '3',
          task: 'Content Writing',
          offeredBy: 'user-3',
          description: 'I can write engaging blog posts, articles, and web content. Native English speaker with 3+ years of content marketing experience.',
          valueType: 'skill',
          valueDetail: '$0.10/word',
          assets: [],
          status: 'pending',
          createdAt: new Date('2024-01-10')
        }
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
      const response = await offersAPI.delete(id);
      setOffers(prev => prev.filter(offer => offer._id !== id));
      toast.success(response.data.message || 'Offer deleted successfully');
    } catch (error) {
      console.error('Error deleting offer:', error);
      toast.error('Failed to delete offer');
    }
  };

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.valueType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || offer.status === statusFilter;
    const matchesValueType = valueTypeFilter === 'all' || offer.valueType === valueTypeFilter;
    
    return matchesSearch && matchesStatus && matchesValueType;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading offers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Offers</h1>
            <p className="text-gray-600 mt-2">Manage your offers and connect with tasks in the community.</p>
          </div>
          
          <button
            onClick={() => navigate('/offers/create')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Offer</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search offers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={valueTypeFilter}
                onChange={(e) => setValueTypeFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No offers found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' || valueTypeFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first offer'}
            </p>
            <button
              onClick={() => navigate('/offers/create')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Create First Offer
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map(offer => (
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