export interface Supply {
  id: string;
  name: string;
  unit: string;
  cost: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplyDto {
  name: string;
  unit: string;
  cost: number;
}

export interface UpdateSupplyDto {
  name?: string;
  unit?: string;
  cost?: number;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}
