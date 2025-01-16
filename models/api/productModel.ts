import DataModel from "./model";


export interface ProductModel extends DataModel {
  id: number;
  productCode: string; // Add this field
  nameEn: string;
  nameKh?: string;
  categoryId: number;
  imageUrl?: string;
  sku?: string;
  createdBy?: number;
  updatedBy?: number;
}
