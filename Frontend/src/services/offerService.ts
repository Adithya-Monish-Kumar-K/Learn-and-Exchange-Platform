import apiClient from './apiClient';
import type {
  IOffer,
  IOfferFilters,
  IOfferListResponse,
  IOfferResponse,
  ICreateOfferPayload,
  IUpdateOfferPayload,
  IAcceptOfferPayload,
  IAddFeedbackPayload,
} from '../types/offer';

/**
 * OfferService
 *
 * Centralized service for all offer-related API operations.
 * Uses apiClient for consistent auth, interceptors, and error handling.
 */
class OfferService {
  private readonly basePath = '/offers';

  /**
   * Get all offers with optional filters and pagination
   * @param filters - Optional filters (page, limit, status, valueType, sortBy, sortOrder, search)
   * @returns Promise<IOfferListResponse>
   */
  async getAllOffers(filters?: IOfferFilters): Promise<IOfferListResponse> {
    const client = apiClient.getClient();
    const params: any = {};

    if (filters) {
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;
      if (filters.status) params.status = filters.status;
      if (filters.valueType) params.valueType = filters.valueType;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.sortOrder) params.sortOrder = filters.sortOrder;
      if (filters.search) params.search = filters.search;
    }

    const { data } = await client.get<IOfferListResponse>(this.basePath, {
      params,
    });
    return data;
  }

  /**
   * Get a single offer by ID
   * @param offerId - The offer ID
   * @returns Promise<IOfferResponse>
   */
  async getOfferById(offerId: string): Promise<IOfferResponse> {
    const client = apiClient.getClient();
    const { data } = await client.get<IOfferResponse>(
      `${this.basePath}/${offerId}`
    );
    return data;
  }

  /**
   * Create a new offer
   * @param payload - Offer creation data
   * @returns Promise<IOfferResponse>
   */
  async createOffer(payload: ICreateOfferPayload): Promise<IOfferResponse> {
    const client = apiClient.getClient();
    const { data } = await client.post<IOfferResponse>(
      this.basePath,
      payload
    );
    return data;
  }

  /**
   * Update an existing offer
   * @param offerId - The offer ID
   * @param payload - Updated offer data
   * @returns Promise<IOfferResponse>
   */
  async updateOffer(
    offerId: string,
    payload: IUpdateOfferPayload
  ): Promise<IOfferResponse> {
    const client = apiClient.getClient();
    const { data } = await client.put<IOfferResponse>(
      `${this.basePath}/${offerId}`,
      payload
    );
    return data;
  }

  /**
   * Delete an offer (soft delete - sets isActive to false)
   * @param offerId - The offer ID
   * @returns Promise<{ status: string; message: string }>
   */
  async deleteOffer(
    offerId: string
  ): Promise<{ status: string; message: string }> {
    const client = apiClient.getClient();
    const { data } = await client.delete<{ status: string; message: string }>(
      `${this.basePath}/${offerId}`
    );
    return data;
  }

  /**
   * Get all offers by a specific user
   * @param userId - The user ID
   * @param filters - Optional filters (status, page, limit)
   * @returns Promise<IOfferListResponse>
   */
  async getOffersByUser(
    userId: string,
    filters?: Partial<IOfferFilters>
  ): Promise<IOfferListResponse> {
    const client = apiClient.getClient();
    const params: any = {};

    if (filters) {
      if (filters.status) params.status = filters.status;
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;
    }

    const { data } = await client.get<IOfferListResponse>(
      `${this.basePath}/user/${userId}`,
      { params }
    );
    return data;
  }

  /**
   * Accept an offer
   * @param offerId - The offer ID
   * @param payload - Acceptance data containing userId
   * @returns Promise<IOfferResponse>
   */
  async acceptOffer(
    offerId: string,
    payload: IAcceptOfferPayload
  ): Promise<IOfferResponse> {
    const client = apiClient.getClient();
    const { data } = await client.post<IOfferResponse>(
      `${this.basePath}/${offerId}/accept`,
      payload
    );
    return data;
  }

  /**
   * Withdraw an offer
   * @param offerId - The offer ID
   * @returns Promise<IOfferResponse>
   */
  async withdrawOffer(offerId: string): Promise<IOfferResponse> {
    const client = apiClient.getClient();
    const { data } = await client.post<IOfferResponse>(
      `${this.basePath}/${offerId}/withdraw`
    );
    return data;
  }

  /**
   * Add feedback to an accepted offer
   * @param offerId - The offer ID
   * @param payload - Feedback data (rating, comment, userId)
   * @returns Promise<IOfferResponse>
   */
  async addFeedback(
    offerId: string,
    payload: IAddFeedbackPayload
  ): Promise<IOfferResponse> {
    const client = apiClient.getClient();
    const { data } = await client.post<IOfferResponse>(
      `${this.basePath}/${offerId}/feedback`,
      payload
    );
    return data;
  }

  /**
   * Get offers by task ID
   * @param taskId - The task ID
   * @param filters - Optional filters
   * @returns Promise<IOfferListResponse>
   */
  async getOffersByTask(
    taskId: string,
    filters?: Partial<IOfferFilters>
  ): Promise<IOfferListResponse> {
    const allFilters: IOfferFilters = {
      ...filters,
      search: taskId,
    };
    return this.getAllOffers(allFilters);
  }

  /**
   * Get pending offers (shortcut method)
   * @param filters - Optional filters
   * @returns Promise<IOfferListResponse>
   */
  async getPendingOffers(
    filters?: Partial<IOfferFilters>
  ): Promise<IOfferListResponse> {
    return this.getAllOffers({
      ...filters,
      status: 'pending',
    });
  }

  /**
   * Get accepted offers (shortcut method)
   * @param filters - Optional filters
   * @returns Promise<IOfferListResponse>
   */
  async getAcceptedOffers(
    filters?: Partial<IOfferFilters>
  ): Promise<IOfferListResponse> {
    return this.getAllOffers({
      ...filters,
      status: 'accepted',
    });
  }

  /**
   * Get offers by value type (shortcut method)
   * @param valueType - The value type to filter by
   * @param filters - Optional additional filters
   * @returns Promise<IOfferListResponse>
   */
  async getOffersByValueType(
    valueType: 'service' | 'skill' | 'asset' | 'other',
    filters?: Partial<IOfferFilters>
  ): Promise<IOfferListResponse> {
    return this.getAllOffers({
      ...filters,
      valueType,
    });
  }

  /**
   * Search offers by keyword
   * @param searchTerm - The search keyword
   * @param filters - Optional additional filters
   * @returns Promise<IOfferListResponse>
   */
  async searchOffers(
    searchTerm: string,
    filters?: Partial<IOfferFilters>
  ): Promise<IOfferListResponse> {
    return this.getAllOffers({
      ...filters,
      search: searchTerm,
    });
  }

  /**
   * Decline an offer (using update with status change)
   * @param offerId - The offer ID
   * @returns Promise<IOfferResponse>
   */
  async declineOffer(offerId: string): Promise<IOfferResponse> {
    return this.updateOffer(offerId, { status: 'declined' });
  }

  /**
   * Get offer statistics for a user
   * @param userId - The user ID
   * @returns Promise with offer counts by status
   */
  async getUserOfferStats(userId: string): Promise<{
    total: number;
    pending: number;
    accepted: number;
    declined: number;
    withdrawn: number;
  }> {
    const allOffers = await this.getOffersByUser(userId, { limit: 1000 });
    const offers = allOffers.data;

    return {
      total: offers.length,
      pending: offers.filter((o) => o.status === 'pending').length,
      accepted: offers.filter((o) => o.status === 'accepted').length,
      declined: offers.filter((o) => o.status === 'declined').length,
      withdrawn: offers.filter((o) => o.status === 'withdrawn').length,
    };
  }

  /**
   * Check if an offer has expired
   * @param offer - The offer object
   * @returns boolean
   */
  isOfferExpired(offer: IOffer): boolean {
    if (!offer.expiresAt) return false;
    const expiryDate =
      typeof offer.expiresAt === 'string'
        ? new Date(offer.expiresAt)
        : offer.expiresAt;
    return expiryDate < new Date();
  }

  /**
   * Get days until offer expires
   * @param offer - The offer object
   * @returns number of days (negative if expired)
   */
  getDaysUntilExpiry(offer: IOffer): number | null {
    if (!offer.expiresAt) return null;
    const expiryDate =
      typeof offer.expiresAt === 'string'
        ? new Date(offer.expiresAt)
        : offer.expiresAt;
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}

const offerService = new OfferService();
export default offerService;
