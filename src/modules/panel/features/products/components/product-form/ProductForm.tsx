import React, { useEffect, useState, useCallback } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { getProductSchema } from "../../schema/product.schema";
import type {
  ProductFormSchema,
  ProductReqData,
} from "../../types/product.types";
import { transformFormDataToApiRequest } from "../../utils/product.utils";
import { apiGetProductMetaFieldAttributes } from "../../services/product.service";
import { apiGetProductAttributes } from "@/modules/panel/services/http/product-attribute.service";
import { apiGetProductAttributeValues as apiGetAttributeValues } from "@/modules/panel/services/http/product-attribute-value.service";
import type { ProductAttribute } from "../../types/product.types";
import { Button } from "@/core/components/ui/button";
import { PaginationComboBox } from "@/core/components/ui/pagination-combo-box";
import { Trash2, Plus } from "lucide-react";
import {
  productAttributeFetcher,
  productAttributeValueFetcher,
} from "../../services/product-fetchers";
import { createSimpleFetcher } from "@/core/components/data-table";

// Fetchers for static options
const productTypeFetcher = createSimpleFetcher(
  () =>
    Promise.resolve({
      data: {
        items: [
          { _id: "simple", name: "Simple product" },
          { _id: "variable", name: "Variable product" },
        ],
        total: 2,
      },
    }),
  {
    dataPath: "data.items",
    totalPath: "data.total",
  },
);

const productStatusFetcher = createSimpleFetcher(
  () =>
    Promise.resolve({
      data: {
        items: [
          { _id: "draft", name: "Draft" },
          { _id: "published", name: "Published" },
          { _id: "archived", name: "Archived" },
        ],
        total: 3,
      },
    }),
  {
    dataPath: "data.items",
    totalPath: "data.total",
  },
);

// Types for API responses
interface ProductAttributeResponse {
  _id: string;
  name: string;
}

interface ProductAttributeValueResponse {
  _id: string;
  label: string;
}

type DropDownOption = {
  label: string;
  value: string;
};

type ProductFormProps = {
  onFormSubmit: (values: ProductReqData) => void;
  defaultValues?: ProductFormSchema;
  newProduct?: boolean;
  setBackendErrorRef?: React.MutableRefObject<
    | ((errors: Array<{ field: string | number; message: string }>) => void)
    | null
  >;
  children?: React.ReactNode;
  // Seller-specific props
  sellerBrands?: Array<{ _id: string; name: string; slug: string }>;
  isSellerMode?: boolean;
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
  onFetchAttributeValues,
}: VariantAttributesSectionProps) => {
  const { watch, setValue } = methods;
  const attributes =
    (watch("attributes") as Array<{
      attributeId: { value: string; label: string } | null;
      attributeValueId: Array<{ value: string; label: string }>;
    }>) || [];

  const addAttribute = () => {
    const newAttributes = [
      ...attributes,
      { attributeId: null, attributeValueId: [] },
    ];
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
    updateAttribute(index, "attributeId", {
      value: attributeId,
      label: variantAttributes.find((a) => a._id === attributeId)?.name || "",
    });
    updateAttribute(index, "attributeValueId", []);
    // Fetch attribute values when attribute is selected
    onFetchAttributeValues(attributeId);
  };

  const handleValueChange = (index: number, selectedValues: string[]) => {
    const selectedOptions = selectedValues.map((value) => {
      const attributeId = attributes[index]?.attributeId?.value;
      const option = attributeValues[attributeId || ""]?.find(
        (opt: DropDownOption) => opt.value === value,
      );
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
        className="flex items-center gap-2 border-blue-600 text-blue-600 hover:bg-blue-50"
      >
        <Plus className="h-4 w-4" />
        Add Variant Attribute
      </Button>

      {/* Attribute List */}
      {attributes.map((attribute, index: number) => (
        <div key={index} className="rounded-lg border bg-gray-50 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="font-medium text-gray-900">
              {attribute.attributeId?.label || "Select an Attribute"}
            </h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeAttribute(index)}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Attribute Selection */}
            <div>
              <label
                htmlFor={`attribute-${index}`}
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Attribute
              </label>
              <PaginationComboBox
                apiFunction={productAttributeFetcher}
                transform={(attr: ProductAttributeResponse) => ({
                  label: attr.name,
                  value: attr._id,
                })}
                placeholder="Select Attribute"
                value={attribute.attributeId?.value || ""}
                onChange={(value: string | string[]) => {
                  if (typeof value === "string" && value) {
                    handleAttributeChange(index, value);
                  }
                }}
                className="w-full"
                queryKey={["product-attributes", index.toString()]}
              />
            </div>

            {/* Attribute Values Selection */}
            <div>
              <label
                htmlFor={`values-${index}`}
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Values
              </label>
              <PaginationComboBox
                apiFunction={
                  attribute.attributeId?.value
                    ? productAttributeValueFetcher(attribute.attributeId.value)
                    : productAttributeValueFetcher("")
                }
                transform={(value: ProductAttributeValueResponse) => ({
                  label: value.label,
                  value: value._id,
                })}
                placeholder="Select Values"
                value={attribute.attributeValueId?.map((v) => v.value) || []}
                onChange={(value: string | string[]) => {
                  if (Array.isArray(value)) {
                    handleValueChange(index, value);
                  }
                }}
                className="w-full"
                multi={true}
                disabled={!attribute.attributeId?.value}
                queryKey={[
                  "product-attribute-values",
                  attribute.attributeId?.value || "",
                  index.toString(),
                ]}
                enabled={!!attribute.attributeId?.value}
              />
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
  const [variantAttributes, setVariantAttributes] = useState<
    ProductAttribute[]
  >([]);
  const [attributeValues, setAttributeValues] = useState<
    Record<string, DropDownOption[]>
  >({});

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
      setAttributeValues((prev) => ({
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
        const response = await apiGetProductMetaFieldAttributes({
          isMetadataField: 1,
          page: 1,
          limit: 100,
        });
        const fields = response?.productAttributes || [];
        setMetaFields(fields);
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

  const handleBackendErrors = useCallback(
    (errors: Array<{ field: string | number; message: string }>) => {
      errors.forEach((error) => {
        const fieldName = String(error.field);
        (
          setError as (
            name: string,
            error: { type: string; message: string },
          ) => void
        )(fieldName, {
          type: "manual",
          message: error.message,
        });
      });
    },
    [setError],
  );

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
      <form className="flex h-full w-full" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex w-full flex-col justify-between">
          <div className="flex flex-col gap-4 xl:flex-row">
            <div className="flex flex-auto flex-col gap-4 lg:min-w-[calc(100%_-_440px)] 2xl:w-[calc(100%_-_500px)]">
              {/* General Section */}
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold">
                  General Information
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="productName"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Product Name *
                    </label>
                    <input
                      id="productName"
                      type="text"
                      {...methods.register("productName")}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Enter product name"
                    />
                    {errors.productName && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.productName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="slug"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Slug *
                    </label>
                    <input
                      id="slug"
                      type="text"
                      {...methods.register("slug")}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="product-slug"
                    />
                    {errors.slug && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.slug.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="productVariationType"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Product Type *
                    </label>
                    <PaginationComboBox
                      apiFunction={productTypeFetcher}
                      transform={(option: { _id: string; name: string }) => ({
                        label: option.name,
                        value: option._id,
                      })}
                      placeholder="Select Product Type"
                      value={productVariationType?.value || ""}
                      onChange={(value: string | string[]) => {
                        const stringValue = Array.isArray(value)
                          ? value[0]
                          : value;
                        if (stringValue) {
                          const option =
                            stringValue === "simple"
                              ? "Simple product"
                              : "Variable product";
                          methods.setValue("productVariationType", {
                            value: stringValue,
                            label: option,
                          });
                        } else {
                          methods.setValue("productVariationType", null);
                        }
                      }}
                      className="w-full"
                      queryKey={["product-types"]}
                    />
                    {errors.productVariationType && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.productVariationType.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="brand"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Brand *
                    </label>
                    {props.isSellerMode && props.sellerBrands ? (
                      <PaginationComboBox
                        apiFunction={createSimpleFetcher(
                          () =>
                            Promise.resolve({
                              data: {
                                items: props.sellerBrands!.map((brand) => ({
                                  _id: brand._id,
                                  name: brand.name,
                                })),
                                total: props.sellerBrands!.length,
                              },
                            }),
                          {
                            dataPath: "data.items",
                            totalPath: "data.total",
                          },
                        )}
                        transform={(option: { _id: string; name: string }) => ({
                          label: option.name,
                          value: option._id,
                        })}
                        placeholder="Select Brand"
                        value={methods.watch("brand")?.value || ""}
                        onChange={(value: string | string[]) => {
                          const stringValue = Array.isArray(value)
                            ? value[0]
                            : value;
                          if (stringValue) {
                            const brand = props.sellerBrands!.find(
                              (b) => b._id === stringValue,
                            );
                            methods.setValue("brand", {
                              value: stringValue,
                              label: brand?.name || "",
                            });
                          } else {
                            methods.setValue("brand", null);
                          }
                        }}
                        className="w-full"
                        queryKey={["seller-brands"]}
                      />
                    ) : (
                      <PaginationComboBox
                        apiFunction={createSimpleFetcher(
                          () =>
                            Promise.resolve({
                              data: {
                                items: [
                                  { _id: "1", name: "Brand 1" },
                                  { _id: "2", name: "Brand 2" },
                                ],
                                total: 2,
                              },
                            }),
                          {
                            dataPath: "data.items",
                            totalPath: "data.total",
                          },
                        )}
                        transform={(option: { _id: string; name: string }) => ({
                          label: option.name,
                          value: option._id,
                        })}
                        placeholder="Select Brand"
                        value={methods.watch("brand")?.value || ""}
                        onChange={(value: string | string[]) => {
                          const stringValue = Array.isArray(value)
                            ? value[0]
                            : value;
                          if (stringValue) {
                            const option =
                              stringValue === "1" ? "Brand 1" : "Brand 2";
                            methods.setValue("brand", {
                              value: stringValue,
                              label: option,
                            });
                          } else {
                            methods.setValue("brand", null);
                          }
                        }}
                        className="w-full"
                        queryKey={["admin-brands"]}
                      />
                    )}
                    {errors.brand && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.brand.message}
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label
                      htmlFor="description"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      {...methods.register("description")}
                      rows={3}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Enter product description"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Section - Only show for simple products */}
              {productVariationType?.value === "simple" && (
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-lg font-semibold">
                    Pricing & Inventory
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <label
                        htmlFor="price"
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        Price
                      </label>
                      <input
                        id="price"
                        type="number"
                        {...methods.register("price")}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="salePrice"
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        Sale Price
                      </label>
                      <input
                        id="salePrice"
                        type="number"
                        {...methods.register("salePrice")}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="quantity"
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        Quantity
                      </label>
                      <input
                        id="quantity"
                        type="number"
                        {...methods.register("quantity")}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Variant Section - Only show for variable products */}
              {productVariationType?.value === "variable" && (
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-lg font-semibold">Variant</h3>

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
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-lg font-semibold">
                    Additional Fields
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {metaFields.map((field) => (
                      <div key={field._id}>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          {field.name}
                          {field.isRequired && " *"}
                        </label>
                        {field.fieldType === "text" && (
                          <input
                            type="text"
                            {...methods.register(field.slug)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder={`Enter ${field.name.toLowerCase()}`}
                          />
                        )}
                        {field.fieldType === "single-select" && (
                          <PaginationComboBox
                            apiFunction={productAttributeValueFetcher(
                              field._id,
                            )}
                            transform={(
                              value: ProductAttributeValueResponse,
                            ) => ({
                              label: value.label,
                              value: value._id,
                            })}
                            placeholder={`Select ${field.name}`}
                            value={(methods.watch(field.slug) as string) || ""}
                            onChange={(value: string | string[]) => {
                              if (typeof value === "string") {
                                methods.setValue(field.slug, value);
                              }
                            }}
                            className="w-full"
                            queryKey={["meta-field-values", field._id]}
                          />
                        )}
                        {field.fieldType === "multi-select" && (
                          <PaginationComboBox
                            apiFunction={productAttributeValueFetcher(
                              field._id,
                            )}
                            transform={(
                              value: ProductAttributeValueResponse,
                            ) => ({
                              label: value.label,
                              value: value._id,
                            })}
                            placeholder={`Select ${field.name}`}
                            value={
                              (methods.watch(field.slug) as string[]) || []
                            }
                            onChange={(value: string | string[]) => {
                              if (Array.isArray(value)) {
                                methods.setValue(field.slug, value);
                              }
                            }}
                            className="w-full"
                            multi={true}
                            queryKey={["meta-field-values-multi", field._id]}
                          />
                        )}
                        {field.fieldType === "rich-textbox" && (
                          <textarea
                            {...methods.register(field.slug)}
                            rows={3}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder={`Enter ${field.name.toLowerCase()}`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4 lg:min-w-[440px] 2xl:w-[500px]">
              {/* Status Section */}
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold">Status</h3>
                <div>
                  <label
                    htmlFor="status"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Product Status
                  </label>
                  <PaginationComboBox
                    apiFunction={productStatusFetcher}
                    transform={(option: { _id: string; name: string }) => ({
                      label: option.name,
                      value: option._id,
                    })}
                    placeholder="Select Status"
                    value={methods.watch("status")?.value || ""}
                    onChange={(value: string | string[]) => {
                      const stringValue = Array.isArray(value)
                        ? value[0]
                        : value;
                      if (stringValue) {
                        const option =
                          stringValue === "draft"
                            ? "Draft"
                            : stringValue === "published"
                              ? "Published"
                              : "Archived";
                        methods.setValue("status", {
                          value: stringValue,
                          label: option,
                        });
                      } else {
                        methods.setValue("status", null);
                      }
                    }}
                    className="w-full"
                    queryKey={["product-statuses"]}
                  />
                </div>
              </div>

              {/* Image Section */}
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold">Images</h3>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="thumbnail"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Thumbnail
                    </label>
                    <input
                      id="thumbnail"
                      type="file"
                      accept="image/*"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="productImages"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Product Images
                    </label>
                    <input
                      id="productImages"
                      type="file"
                      accept="image/*"
                      multiple
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          {isDirty && (
            <div className="sticky bottom-0 flex justify-end gap-3 border-t bg-white p-4">
              {children}
            </div>
          )}
        </div>
      </form>
    </FormProvider>
  );
};

export default ProductForm;
