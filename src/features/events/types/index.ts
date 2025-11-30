export interface Event {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    isClosed: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface EventStatistics {
    totalRevenue: number;
    totalInvestment: number;
    topSellingItems: { [key: string]: number };
    totalOrders: number;
    totalSupplies: number;
    totalProducts: number;
}

export interface EventUser {
    id: string;
    name: string;
    role: string;
}

export interface EventPromotion {
    id: string;
    eventId: string;
    name: string;
    description: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    validFrom: string;
    validTo: string;
    isActive: boolean;
}

export interface CreateEventDto {
    name: string;
    startDate: string;
    endDate: string;
}

export interface UpdateEventDto extends Partial<CreateEventDto> {
    isActive?: boolean;
    isClosed?: boolean;
}
