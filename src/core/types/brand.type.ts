export type BrandStatus = "active" | "closed" | "pending" | "inactive";

export interface Brand {
  id?: string | number;
  name: string;
  category: string;
  image: string;
  status: BrandStatus;
  products: number;
  surveys: number;
  promotions: number;
  earnings: number;
}
