export type SelectOption = {
  label: string;
  value: string;
};

export type GeneralFields = {
  productName: string;
  slug: string;
  description?: string;
  status?: SelectOption | null;
  sku?: string;
  brand?: SelectOption | null;
  aboutTheBrand?: string;
  productCategory?: SelectOption[] | null;
  tags?: SelectOption[] | null;
  marketedBy?: SelectOption | null;
  marketedByAddress?: string;
  manufacturedBy?: SelectOption | null;
  manufacturedByAddress?: string;
  importedBy?: SelectOption | null;
  importedByAddress?: string;
  capturedBy?: SelectOption | null;
  capturedDate?: string | Date;
};

export type AttributeFields = {
  ingredients?: SelectOption[] | null;
  keyIngredients?: SelectOption[] | null;
  benefit?: SelectOption[] | null;
};

export type ImageFields = {
  thumbnail?:
    | {
        _id: string;
        url: string;
      }[]
    | [];
  images?:
    | {
        _id: string;
        url: string;
      }[]
    | [];
  barcodeImage?:
    | {
        _id: string;
        url: string;
      }[]
    | [];
};

export type PricingFields = {
  dimensions?: {
    length: number | string;
    width: number | string;
    height: number | string;
  };
  price?: number | string;
  salePrice?: number | string;
  quantity?: number | string;
  manufacturingDate?: string | Date;
  expiryDate?: string | Date;
};

export type MetaFieldValue = {
  key: string;
  value: string | SelectOption | null;
  type: 'string' | 'array' | 'objectId' | 'rich-text-box';
  ref: boolean;
};

export type MetaFields = {
  metaData?: MetaFieldValue[];
};

export type VariantAttribute = {
  attributeId: SelectOption | null;
  attributeValueId: SelectOption | SelectOption[] | null;
};

export type VariantFields = {
  productVariationType?: SelectOption | null;
  attributes?: VariantAttribute[];
  removeAttributes?: string[];
  variants?: {
    id?: string;
    sku?: string;
    dimensions?: {
      length?: string | number;
      width?: string | number;
      height?: string | number;
    };
    price?: string | number;
    salePrice?: string | number;
    quantity?: string | number;
    manufacturingDate?: string | Date;
    expiryDate?: string | Date;
    options: {
      attributeId: string;
      attributeValueId: string;
    }[];
  }[];
};

export type ProductFormSchema = GeneralFields &
  PricingFields &
  ImageFields &
  AttributeFields &
  MetaFields &
  VariantFields & {
    [key: string]: any;
  };

export type ProductReqData = {
  productName: string;
  slug: string;
  description?: string;
  status?: string;
  sku?: string;
  productVariationType?: string;
  brand?: string;
  aboutTheBrand?: string;
  productCategory?: string[];
  tags?: string[];
  marketedBy?: string;
  marketedByAddress?: string;
  manufacturedBy?: string;
  manufacturedByAddress?: string;
  importedBy?: string;
  importedByAddress?: string;
  capturedBy?: string;
  capturedDate?: string;
  ingredients?: string[];
  keyIngredients?: string[];
  benefit?: string[];
  thumbnail?: string;
  images?: string[];
  barcodeImage?: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  price?: number;
  salePrice?: number;
  quantity?: number;
  manufacturingDate?: string;
  expiryDate?: string;
  metaData?: MetaFieldValue[];
  attributes?: {
    attributeId: string;
    attributeValueId: string[];
  }[];
  removeAttributes?: string[];
  variants?: {
    id?: string;
    sku?: string;
    dimensions?: {
      length?: number;
      width?: number;
      height?: number;
    };
    price?: number;
    salePrice?: number;
    quantity?: number;
    manufacturingDate?: string;
    expiryDate?: string;
    options: {
      attributeId: string;
      attributeValueId: string;
    }[];
  }[];
  removeVariants?: string[];
};

export type ProductAttribute = {
  _id: string;
  name: string;
  slug: string;
  fieldType: string;
  isRequired: boolean;
  isMetadataField: boolean;
};

export type ProductAttributeResponse = {
  productAttributes: ProductAttribute[];
};

export type FormSectionBaseProps = {
  control: any; // Will be properly typed with react-hook-form
  errors: any; // Will be properly typed with react-hook-form
  setValue?: any; // Will be properly typed with react-hook-form
};

