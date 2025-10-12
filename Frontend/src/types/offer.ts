export interface IOffer {
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

export interface IOfferFilters {
  page?: number;
  limit?: number;
  status?: "pending" | "accepted" | "declined" | "withdrawn" | "all";
  valueType?: "service" | "skill" | "asset" | "other" | "all";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}

export interface IOfferPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface IOfferListResponse {
  status: string;
  results: number;
  pagination: IOfferPagination;
  data: IOffer[];
}

export interface IOfferResponse {
  status: string;
  message?: string;
  data: IOffer;
}

export interface ICreateOfferPayload {
  task: string;
  offeredBy: string;
  description: string;
  valueType: "service" | "skill" | "asset" | "other";
  valueDetail?: string;
  assets?: string[];
  expiresAt?: Date | string;
  priority?: "low" | "medium" | "high";
  estimatedDelivery?: Date | string;
  terms?: string;
}

export interface IUpdateOfferPayload {
  description?: string;
  valueType?: "service" | "skill" | "asset" | "other";
  valueDetail?: string;
  assets?: string[];
  status?: "pending" | "accepted" | "declined" | "withdrawn";
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
  task?: string;
}

export interface IAcceptOfferPayload {
  userId: string;
}

export interface IAddFeedbackPayload {
  rating: number;
  comment?: string;
  userId: string;
}
