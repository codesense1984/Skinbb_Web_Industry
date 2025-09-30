import React, { useEffect, useState, useCallback } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { getProductSchema } from "../../schema/product.schema";
import type { ProductFormSchema, ProductReqData } from "../../types/product.types";
import { transformFormDataToApiRequest } from "../../utils/product.utils";
import { 
  apiGetProductMetaFieldAttributes, 
  apiGetProductAttributeValues 
} from "../../services/product.service";
import { apiGetProductAttributes } from "@/modules/panel/services/http/product-attribute.service";
import { apiGetProductAttributeValues as apiGetAttributeValues } from "@/modules/panel/services/http/product-attribute-value.service";
import type { ProductAttribute } from "../../types/product.types";
import { Button } from "@/core/components/ui/button";
import { Trash2, Plus } from "lucide-react";

type DropDownOption = {
  label: string;
  value: string;
};

type ProductFormProps = {
  onFormSubmit: (values: ProductReqData) => void;
  defaultValues?: ProductFormSchema;
  newProduct?: boolean;
  setBackendErrorRef?: React.MutableRefObject<
    ((errors: Array<{ field: string | number; message: string }>) => void) | null
  >;
  children?: React.ReactNode;
};

// Variant Attributes Section Component
interface VariantAttributesSectionProps {
  methods: {
    watch: (name: string) => unknown;
    setValue: (name: string, value: unknown) => void;
  };
  variantAttributes: ProductAttribute[];
  attributeValues: Record<string, DropDownOption[]>;
  onFetchAttributeValues: (attributeId: string) => void;
}

const VariantAttributesSection = ({ 
  methods, 
  variantAttributes, 
  attributeValues, 
  onFetchAttributeValues 
}: VariantAttributesSectionProps) => {
  const { watch, setValue } = methods;
  const attributes = (watch("attributes") as Array<{
    attributeId: { value: string; label: string } | null;
    attributeValueId: Array<{ value: string; label: string }>;
  }>) || [];

  const addAttribute = () => {
    const newAttributes = [...attributes, { attributeId: null, attributeValueId: [] }];
    setValue("attributes", newAttributes);
  };

  const removeAttribute = (index: number) => {
    const newAttributes = attributes.filter((_, i: number) => i !== index);
    setValue("attributes", newAttributes);
  };

  const updateAttribute = (index: number, field: string, value: unknown) => {
    const newAttributes = [...attributes];
    newAttributes[index] = { ...newAttributes[index], [field]: value };
    setValue("attributes", newAttributes);
  };

  const handleAttributeChange = (index: number, attributeId: string) => {
    updateAttribute(index, "attributeId", { value: attributeId, label: variantAttributes.find(a => a._id === attributeId)?.name || "" });
    updateAttribute(index, "attributeValueId", []);
    // Fetch attribute values when attribute is selected
    onFetchAttributeValues(attributeId);
  };

  const handleValueChange = (index: number, selectedValues: string[]) => {
    const selectedOptions = selectedValues.map(value => {
      const attributeId = attributes[index]?.attributeId?.value;
      const option = attributeValues[attributeId || ""]?.find((opt: DropDownOption) => opt.value === value);
      return { value, label: option?.label || "" };
    });
    updateAttribute(index, "attributeValueId", selectedOptions);
  };

  return (
    <div className="space-y-4">
      {/* Add Variant Attribute Button */}
      <Button
        type="button"
        variant="outlined"
        onClick={addAttribute}
        className="flex items-center gap-2 text-blue-600 border-blue-600 hover:bg-blue-50"
      >
        <Plus className="w-4 h-4" />
        Add Variant Attribute
      </Button>

      {/* Attribute List */}
      {attributes.map((attribute, index: number) => (
        <div key={index} className="bg-gray-50 p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">
              {attribute.attributeId?.label || "Select an Attribute"}
            </h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeAttribute(index)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Attribute Selection */}
            <div>
              <label htmlFor={`attribute-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                Attribute
              </label>
              <select
                id={`attribute-${index}`}
                value={attribute.attributeId?.value || ""}
                onChange={(e) => handleAttributeChange(index, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Attribute</option>
                {variantAttributes.map((attr) => (
                  <option key={attr._id} value={attr._id}>
                    {attr.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Attribute Values Selection */}
            <div>
              <label htmlFor={`values-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                Values
              </label>
              <select
                id={`values-${index}`}
                multiple
                value={attribute.attributeValueId?.map((v) => v.value) || []}
                onChange={(e) => {
                  const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
                  handleValueChange(index, selectedValues);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!attribute.attributeId?.value}
              >
                {attribute.attributeId?.value ? (
                  attributeValues[attribute.attributeId.value]?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  )) || <option disabled>No options available</option>
                ) : (
                  <option disabled>Select Attribute Value</option>
                )}
              </select>
              {attribute.attributeId?.value && !attributeValues[attribute.attributeId.value]?.length && (
                <p className="text-sm text-gray-500 mt-1">No options</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const ProductForm = (props: ProductFormProps) => {
  const { onFormSubmit, defaultValues, children, setBackendErrorRef } = props;

  const [metaFields, setMetaFields] = useState<ProductAttribute[]>([]);
  const [selectOptions, setSelectOptions] = useState<
    Record<string, DropDownOption[]>
  >({});
  const [variantAttributes, setVariantAttributes] = useState<ProductAttribute[]>([]);
  const [attributeValues, setAttributeValues] = useState<Record<string, DropDownOption[]>>({});

  // Fetch variant attributes
  const fetchVariantAttributes = async () => {
    try {
      const response = await apiGetProductAttributes({
        isVariantField: true,
        page: 1,
        limit: 100,
      });
      const attributes = response?.data?.productAttributes || [];
      setVariantAttributes(attributes);
    } catch (err) {
      console.error("Failed to load variant attributes", err);
      toast.error("Failed to load variant attributes");
    }
  };

  // Fetch attribute values for a specific attribute
  const fetchAttributeValues = async (attributeId: string) => {
    try {
      const response = await apiGetAttributeValues({
        attributeId,
        page: 1,
        limit: 100,
      });
      const values = response?.data?.productAttributeValues || [];
      const options = values.map((v: { label: string; _id: string }) => ({
        label: v.label,
        value: v._id,
      }));
      setAttributeValues(prev => ({
        ...prev,
        [attributeId]: options,
      }));
    } catch (err) {
      console.error(`Failed to load values for attribute ${attributeId}`, err);
      toast.error("Failed to load attribute values");
    }
  };

  useEffect(() => {
    const fetchMetaFieldsAndOptions = async () => {
      try {
        const response =
          await apiGetProductMetaFieldAttributes({
            isMetadataField: 1,
            page: 1,
            limit: 100,
          });
        const fields = response?.productAttributes || [];
        setMetaFields(fields);

        const selectFields = fields.filter(
          (f: ProductAttribute) =>
            f.fieldType === "single-select" ||
            f.fieldType === "multi-select",
        );

        const optionsMap: Record<string, DropDownOption[]> = {};

        await Promise.all(
          selectFields.map(async (field: ProductAttribute) => {
            try {
              const res = await apiGetProductAttributeValues({
                attributeId: field._id,
              });
              const values = (res as { productAttributeValues?: Array<{ label: string; _id: string }> })?.productAttributeValues || [];
              optionsMap[field._id] = values.map((v: { label: string; _id: string }) => ({
                label: v.label,
                value: v._id,
              }));
            } catch (err) {
              console.warn(
                `Failed to fetch options for ${field.name}`,
                err,
              );
            }
          }),
        );

        setSelectOptions(optionsMap);
      } catch (err) {
        console.error("Failed to load meta fields", err);
        toast.error("Failed to load form fields");
      }
    };

    fetchMetaFieldsAndOptions();
    fetchVariantAttributes();
  }, []);

  const methods = useForm<ProductFormSchema>({
    defaultValues: {
      ...defaultValues,
    },
    resolver: zodResolver(getProductSchema()),
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const {
    handleSubmit,
    reset,
    formState: { errors, isDirty },
    control,
    setError,
  } = methods;

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  const handleBackendErrors = useCallback((errors: Array<{ field: string | number; message: string }>) => {
    errors.forEach((error) => {
      const fieldName = String(error.field);
      (setError as (name: string, error: { type: string; message: string }) => void)(fieldName, {
        type: "manual",
        message: error.message,
      });
    });
  }, [setError]);

  useEffect(() => {
    if (setBackendErrorRef) {
      setBackendErrorRef.current = handleBackendErrors;
    }
  }, [setError, setBackendErrorRef, handleBackendErrors]);

  // const mapFieldTypeToMetaType = (
  //   fieldType: string,
  // ): 'string' | 'array' | 'objectId' | 'rich-text-box' => {
  //   switch (fieldType) {
  //     case 'multi-select':
  //       return 'array';
  //     case 'single-select':
  //       return 'objectId';
  //     case 'rich-textbox':
  //       return 'rich-text-box';
  //     case 'text':
  //     default:
  //       return 'string';
  //   }
  // };

  const onSubmit = (values: ProductFormSchema) => {
    try {
      const cleanedValues = transformFormDataToApiRequest(values, metaFields);
      console.log("Submitted values:", cleanedValues);
      onFormSubmit?.(cleanedValues);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to process form data");
    }
  };

  const productVariationType = useWatch({
    control,
    name: "productVariationType",
  });

  return (
    <FormProvider {...methods}>
      <form
        className="flex w-full h-full"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-col w-full justify-between">
          <div className="flex flex-col xl:flex-row gap-4">
            <div className="gap-4 flex flex-col flex-auto lg:min-w-[calc(100%_-_440px)] 2xl:w-[calc(100%_-_500px)]">
              {/* General Section */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">General Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      id="productName"
                      type="text"
                      {...methods.register("productName")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter product name"
                    />
                    {errors.productName && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.productName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                      Slug *
                    </label>
                    <input
                      id="slug"
                      type="text"
                      {...methods.register("slug")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="product-slug"
                    />
                    {errors.slug && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.slug.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="productVariationType" className="block text-sm font-medium text-gray-700 mb-1">
                      Product Type *
                    </label>
                    <select
                      id="productVariationType"
                      value={productVariationType?.value || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        methods.setValue("productVariationType", value ? { value, label: value === "simple" ? "Simple product" : "Variable product" } : null);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Product Type</option>
                      <option value="simple">Simple product</option>
                      <option value="variable">Variable product</option>
                    </select>
                    {errors.productVariationType && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.productVariationType.message}
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      {...methods.register("description")}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter product description"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Section - Only show for simple products */}
              {productVariationType?.value === "simple" && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold mb-4">Pricing & Inventory</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                        Price
                      </label>
                      <input
                        id="price"
                        type="number"
                        {...methods.register("price")}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label htmlFor="salePrice" className="block text-sm font-medium text-gray-700 mb-1">
                        Sale Price
                      </label>
                      <input
                        id="salePrice"
                        type="number"
                        {...methods.register("salePrice")}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        id="quantity"
                        type="number"
                        {...methods.register("quantity")}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Variant Section - Only show for variable products */}
              {productVariationType?.value === "variable" && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold mb-4">Variant</h3>
                  
                  {/* Variant Attributes */}
                  <VariantAttributesSection 
                    methods={methods}
                    variantAttributes={variantAttributes}
                    attributeValues={attributeValues}
                    onFetchAttributeValues={fetchAttributeValues}
                  />
                </div>
              )}

              {/* Meta Fields Section */}
              {metaFields.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold mb-4">Additional Fields</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {metaFields.map((field) => (
                      <div key={field._id}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {field.name}
                          {field.isRequired && " *"}
                        </label>
                        {field.fieldType === "text" && (
                          <input
                            type="text"
                            {...methods.register(field.slug)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`Enter ${field.name.toLowerCase()}`}
                          />
                        )}
                        {field.fieldType === "single-select" && (
                          <select
                            {...methods.register(field.slug)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select {field.name}</option>
                            {selectOptions[field._id]?.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        )}
                        {field.fieldType === "multi-select" && (
                          <select
                            {...methods.register(field.slug)}
                            multiple
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {selectOptions[field._id]?.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        )}
                        {field.fieldType === "rich-textbox" && (
                          <textarea
                            {...methods.register(field.slug)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`Enter ${field.name.toLowerCase()}`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:min-w-[440px] 2xl:w-[500px] gap-4 flex flex-col">
              {/* Status Section */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Status</h3>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Product Status
                  </label>
                  <select
                    id="status"
                    {...methods.register("status")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Status</option>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Image Section */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Images</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 mb-1">
                      Thumbnail
                    </label>
                    <input
                      id="thumbnail"
                      type="file"
                      accept="image/*"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="productImages" className="block text-sm font-medium text-gray-700 mb-1">
                      Product Images
                    </label>
                    <input
                      id="productImages"
                      type="file"
                      accept="image/*"
                      multiple
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          {isDirty && (
            <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end gap-3">
              {children}
            </div>
          )}
        </div>
      </form>
    </FormProvider>
  );
};

export default ProductForm;
