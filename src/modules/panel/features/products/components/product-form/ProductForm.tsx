import { useEffect, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { getProductSchema } from '../../schema/product.schema';
import type { ProductFormSchema, ProductReqData } from '../../types/product.types';
import { transformFormDataToApiRequest } from '../../utils/product.utils';
import { 
  apiGetProductMetaFieldAttributes, 
  apiGetProductAttributeValues 
} from '../../services/product.service';
import type { ProductAttribute } from '../../types/product.types';
import { FormInput, INPUT_TYPES, FormFieldsRenderer } from '@/core/components/ui/form-input';

type DropDownOption = {
  label: string;
  value: string;
};

type ProductFormProps = {
  onFormSubmit: (values: ProductReqData) => void;
  defaultValues?: ProductFormSchema;
  newProduct?: boolean;
  setBackendErrorRef?: React.MutableRefObject<
    ((errors: any[]) => void) | null
  >;
  children?: React.ReactNode;
};

const SIMPLE_PRODUCT_ID = '685a4f3f2d20439677a5e89d';

const ProductForm = (props: ProductFormProps) => {
  const { onFormSubmit, defaultValues, children, setBackendErrorRef } = props;

  const [metaFields, setMetaFields] = useState<ProductAttribute[]>([]);
  const [selectOptions, setSelectOptions] = useState<
    Record<string, DropDownOption[]>
  >({});

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
            f.fieldType === 'single-select' ||
            f.fieldType === 'multi-select',
        );

        const optionsMap: Record<string, DropDownOption[]> = {};

        await Promise.all(
          selectFields.map(async (field: ProductAttribute) => {
            try {
              const res = await apiGetProductAttributeValues({
                attributeId: field._id,
              });
              const values = (res as any)?.productAttributeValues || [];
              optionsMap[field._id] = values.map((v: any) => ({
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
        console.error('Failed to load meta fields', err);
        toast.error('Failed to load form fields');
      }
    };

    fetchMetaFieldsAndOptions();
  }, []);

  const methods = useForm<ProductFormSchema>({
    defaultValues: {
      ...defaultValues,
    },
    resolver: zodResolver(getProductSchema()),
    mode: 'onTouched',
    reValidateMode: 'onChange',
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

  useEffect(() => {
    if (setBackendErrorRef) {
      setBackendErrorRef.current = (errors: any[]) => {
        errors.forEach((error) => {
          setError(error.field as any, {
            type: 'manual',
            message: error.message,
          });
        });
      };
    }
  }, [setError, setBackendErrorRef]);

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
      console.log('Submitted values:', cleanedValues);
      onFormSubmit?.(cleanedValues);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to process form data');
    }
  };

  const productVariationType = useWatch({
    control,
    name: 'productVariationType',
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      {...methods.register('productName')}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug *
                    </label>
                    <input
                      type="text"
                      {...methods.register('slug')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="product-slug"
                    />
                    {errors.slug && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.slug.message}
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      {...methods.register('description')}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter product description"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Section - Only show for simple products */}
              {productVariationType?.value === SIMPLE_PRODUCT_ID && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold mb-4">Pricing & Inventory</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price
                      </label>
                      <input
                        type="number"
                        {...methods.register('price')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sale Price
                      </label>
                      <input
                        type="number"
                        {...methods.register('salePrice')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        {...methods.register('quantity')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                  </div>
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
                          {field.isRequired && ' *'}
                        </label>
                        {field.fieldType === 'text' && (
                          <input
                            type="text"
                            {...methods.register(field.slug)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`Enter ${field.name.toLowerCase()}`}
                          />
                        )}
                        {field.fieldType === 'single-select' && (
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
                        {field.fieldType === 'multi-select' && (
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
                        {field.fieldType === 'rich-textbox' && (
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Status
                  </label>
                  <select
                    {...methods.register('status')}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thumbnail
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Images
                    </label>
                    <input
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
