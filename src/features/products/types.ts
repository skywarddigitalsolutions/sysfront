export interface Product {
    id: string;
    name: string;
    cost: number;
    isActive: boolean;
}

export interface EventProductInventory {
    eventId: string;
    productId: string;
    product: Product;
    initialQty: number;
    currentQty: number;
    minQty: number;
    cost: number;
    salePrice: number;
    profitMargin: number;
    hasRecipe: boolean;
    isActive: boolean;
}

export interface ProductSupply {
    supply: {
        id: string;
        name: string;
        unit: string;
    };
    qtyPerUnit: number;
}
