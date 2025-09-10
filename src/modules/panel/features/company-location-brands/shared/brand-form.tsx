import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/core/components/ui/button';
import { Input } from '@/core/components/ui/input';
import { Label } from '@/core/components/ui/label';
import { Textarea } from '@/core/components/ui/textarea';
import { SelectRoot, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select';
import { Checkbox } from '@/core/components/ui/checkbox';
import { useImagePreview } from '@/core/hooks/useImagePreview';
import { apiGetCompanyLocationBrandById, apiCreateCompanyLocationBrand, apiUpdateCompanyLocationBrand } from '@/modules/panel/services/http/company.service';
import { PANEL_ROUTES } from '@/modules/panel/routes/constant';
import type { CompanyLocationBrand, CompanyLocationBrandCreateData } from '@/modules/panel/types/company.type';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';

const brandFormSchema = z.object({
  name: z.string()
    .min(1, 'Brand name is required')
    .min(2, 'Brand name must be at least 2 characters')
    .max(100, 'Brand name must be less than 100 characters'),
  aboutTheBrand: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  totalSKU: z.number().min(0).optional(),
  averageSellingPrice: z.number().min(0).optional(),
  marketingBudget: z.number().min(0).optional(),
  instagramUrl: z.string().url().optional().or(z.literal('')),
  facebookUrl: z.string().url().optional().or(z.literal('')),
  youtubeUrl: z.string().url().optional().or(z.literal('')),
  productCategory: z.array(z.string()).optional(),
  sellingOn: z.array(z.object({
    platform: z.string(),
    url: z.string().url(),
  })).optional(),
  isActive: z.boolean().optional(),
});

type BrandFormData = z.infer<typeof brandFormSchema>;

const BrandForm = () => {
  const { companyId, locationId, brandId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const mode = location.pathname.includes('/edit') ? 'edit' : 
               location.pathname.includes('/view') ? 'view' : 'create';
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [brandData, setBrandData] = useState<CompanyLocationBrand | null>(null);

  // Image preview hooks
  const { preview: logoPreview, handleImageChange: handleLogoChange, clearPreview: clearLogoPreview } = useImagePreview();
  const { preview: coverPreview, handleImageChange: handleCoverChange, clearPreview: clearCoverPreview } = useImagePreview();
  const { preview: authPreview, handleImageChange: handleAuthChange, clearPreview: clearAuthPreview } = useImagePreview();

  const form = useForm<BrandFormData>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      name: '',
      aboutTheBrand: '',
      websiteUrl: '',
      totalSKU: 0,
      averageSellingPrice: 0,
      marketingBudget: 0,
      instagramUrl: '',
      facebookUrl: '',
      youtubeUrl: '',
      productCategory: [],
      sellingOn: [],
      isActive: true,
    },
  });

  const { handleSubmit, watch, setValue, formState: { errors } } = form;

  // Fetch brand data for edit/view mode
  useEffect(() => {
    const fetchBrandData = async () => {
      if (brandId && (mode === 'edit' || mode === 'view')) {
        setIsLoading(true);
        setError(null);
        
        try {
          console.log('Fetching brand data for:', { companyId, locationId, brandId, mode });
          const response = await apiGetCompanyLocationBrandById(companyId!, locationId!, brandId);
          console.log('Brand API Response:', response);
          
          // Handle different possible response structures
          let brand = null;
          if (response.data?.success && response.data?.data) {
            brand = response.data.data;
          } else if (response.data?.data) {
            brand = response.data.data;
          } else if (response.data) {
            brand = response.data;
          }
          
          if (brand) {
            console.log('Brand data found:', brand);
            setBrandData(brand);
            
            // Reset form first, then set values
            form.reset();
            
            // Use setTimeout to ensure form is ready
            setTimeout(() => {
              // Set form values
              setValue('name', brand.name || '');
              setValue('aboutTheBrand', brand.aboutTheBrand || '');
              setValue('websiteUrl', brand.websiteUrl || '');
              setValue('totalSKU', brand.totalSKU || 0);
              setValue('averageSellingPrice', brand.averageSellingPrice || 0);
              setValue('marketingBudget', brand.marketingBudget || 0);
              setValue('instagramUrl', brand.instagramUrl || '');
              setValue('facebookUrl', brand.facebookUrl || '');
              setValue('youtubeUrl', brand.youtubeUrl || '');
              setValue('productCategory', brand.productCategory || []);
              setValue('sellingOn', brand.sellingOn || []);
              setValue('isActive', brand.isActive ?? true);
              
              console.log('Form values set successfully');
            }, 100);
          } else {
            console.error('No brand data found in response');
            setError('No brand data found');
          }
        } catch (error: any) {
          console.error('Error fetching brand data:', error);
          setError(error?.response?.data?.message || error?.message || 'Failed to load brand data');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchBrandData();
  }, [brandId, mode, companyId, locationId, setValue]);

  const onSubmit = async (data: BrandFormData) => {
    if (!companyId || !locationId) return;
    
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      const formData = new FormData();
      
      // Add form data
      Object.entries(data).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (typeof item === 'object') {
              formData.append(`${key}[${index}][platform]`, item.platform);
              formData.append(`${key}[${index}][url]`, item.url);
            } else {
              formData.append(`${key}[]`, item);
            }
          });
        } else if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      let result;
      if (mode === 'edit' && brandId) {
        result = await apiUpdateCompanyLocationBrand(companyId, locationId, brandId, formData);
      } else {
        result = await apiCreateCompanyLocationBrand(companyId, locationId, formData);
      }

      // Debug the response structure
      console.log('Brand API Response:', result);
      console.log('Response data:', result.data);
      console.log('Response data.data:', result.data?.data);
      console.log('Success check:', result.data?.success);
      console.log('Data status:', result.data?.data?.status);
      console.log('Status code:', result.status);

      // Check for success - handle different possible response structures
      const isSuccess = result.status >= 200 && result.status < 300 && 
                       (result.data?.success === true || 
                        result.data?.data?.status === 'success' ||
                        result.data?.status === 'success' ||
                        result.status === 200 || result.status === 201);

      if (isSuccess) {
        // Show success message
        const successMessage = result.data?.message || 
                              result.data?.data?.message ||
                              (mode === 'edit' ? 'Brand updated successfully!' : 'Brand created successfully!');
        
        toast.success(successMessage);
        
        // Navigate back to brands list
        navigate(PANEL_ROUTES.COMPANY_LOCATION.BRANDS(companyId, locationId));
      } else {
        // Handle API response error
        const errorMessage = result.data?.message || 
                           result.data?.data?.message ||
                           result.data?.error ||
                           'Failed to save brand';
        console.log('Error response:', result);
        toast.error(errorMessage);
        setError(errorMessage);
      }
    } catch (error: any) {
      console.error('Brand save error:', error);
      
      // Handle different types of errors
      const axiosError = error as AxiosError<{ message?: string; error?: string }>;
      
      if (axiosError.response?.status === 409) {
        // Duplicate brand name error
        const errorMessage = axiosError.response.data?.message || 'Brand name already exists';
        toast.error(errorMessage);
        setError(errorMessage);
        setFieldErrors({ name: errorMessage });
      } else if (axiosError.response?.status === 400) {
        // Validation error
        const errorMessage = axiosError.response.data?.message || 'Invalid data provided';
        toast.error(errorMessage);
        setError(errorMessage);
      } else if (axiosError.response?.status === 404) {
        // Not found error
        const errorMessage = 'Company or location not found';
        toast.error(errorMessage);
        setError(errorMessage);
      } else {
        // Generic error
        const errorMessage = axiosError.response?.data?.message || 
                           axiosError.message || 
                           'Failed to save brand. Please try again.';
        toast.error(errorMessage);
        setError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(PANEL_ROUTES.COMPANY_LOCATION.BRANDS(companyId!, locationId!));
  };

  const addSellingPlatform = () => {
    const currentSellingOn = watch('sellingOn') || [];
    setValue('sellingOn', [...currentSellingOn, { platform: '', url: '' }]);
  };

  const removeSellingPlatform = (index: number) => {
    const currentSellingOn = watch('sellingOn') || [];
    setValue('sellingOn', currentSellingOn.filter((_, i) => i !== index));
  };

  const updateSellingPlatform = (index: number, field: 'platform' | 'url', value: string) => {
    const currentSellingOn = watch('sellingOn') || [];
    const updated = [...currentSellingOn];
    updated[index] = { ...updated[index], [field]: value };
    setValue('sellingOn', updated);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading brand data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-800">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Debug information - remove in production */}
      {process.env.NODE_ENV === 'development' && brandData && (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <div className="text-sm text-gray-600">
            <strong>Debug - Brand Data:</strong>
            <pre className="mt-2 text-xs overflow-auto max-h-32">
              {JSON.stringify(brandData, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Basic Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Brand Name *</Label>
              <Input
                id="name"
                {...form.register('name', {
                  onChange: () => {
                    if (fieldErrors.name) {
                      setFieldErrors(prev => ({ ...prev, name: '' }));
                    }
                  }
                })}
                placeholder="Enter brand name"
                disabled={mode === 'view'}
                className={fieldErrors.name ? 'border-red-500 focus:border-red-500' : ''}
              />
              {(errors.name || fieldErrors.name) && (
                <p className="text-sm text-red-600">
                  {fieldErrors.name || errors.name?.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input
                id="websiteUrl"
                {...form.register('websiteUrl')}
                placeholder="https://example.com"
                disabled={mode === 'view'}
              />
              {errors.websiteUrl && (
                <p className="text-sm text-red-600">{errors.websiteUrl.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="aboutTheBrand">About the Brand</Label>
            <Textarea
              id="aboutTheBrand"
              {...form.register('aboutTheBrand')}
              placeholder="Describe the brand..."
              rows={4}
              disabled={mode === 'view'}
            />
          </div>
        </div>

        {/* Business Metrics */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Business Metrics
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="totalSKU">Total SKU</Label>
              <Input
                id="totalSKU"
                type="number"
                {...form.register('totalSKU', { valueAsNumber: true })}
                placeholder="0"
                disabled={mode === 'view'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="averageSellingPrice">Average Selling Price</Label>
              <Input
                id="averageSellingPrice"
                type="number"
                step="0.01"
                {...form.register('averageSellingPrice', { valueAsNumber: true })}
                placeholder="0.00"
                disabled={mode === 'view'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="marketingBudget">Marketing Budget</Label>
              <Input
                id="marketingBudget"
                type="number"
                step="0.01"
                {...form.register('marketingBudget', { valueAsNumber: true })}
                placeholder="0.00"
                disabled={mode === 'view'}
              />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Social Media
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="instagramUrl">Instagram URL</Label>
              <Input
                id="instagramUrl"
                {...form.register('instagramUrl')}
                placeholder="https://instagram.com/username"
                disabled={mode === 'view'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebookUrl">Facebook URL</Label>
              <Input
                id="facebookUrl"
                {...form.register('facebookUrl')}
                placeholder="https://facebook.com/username"
                disabled={mode === 'view'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtubeUrl">YouTube URL</Label>
              <Input
                id="youtubeUrl"
                {...form.register('youtubeUrl')}
                placeholder="https://youtube.com/username"
                disabled={mode === 'view'}
              />
            </div>
          </div>
        </div>

        {/* Selling Platforms */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Selling Platforms
            </h3>
            {mode !== 'view' && (
              <Button type="button" onClick={addSellingPlatform} variant="outlined" size="sm">
                Add Platform
              </Button>
            )}
          </div>
          
          <div className="space-y-3">
            {watch('sellingOn')?.map((platform, index) => (
              <div key={index} className="flex gap-3 items-end">
                <div className="flex-1">
                  <Label>Platform</Label>
                  <Input
                    value={platform.platform}
                    onChange={(e) => updateSellingPlatform(index, 'platform', e.target.value)}
                    placeholder="e.g., Amazon, Flipkart"
                    disabled={mode === 'view'}
                  />
                </div>
                <div className="flex-1">
                  <Label>URL</Label>
                  <Input
                    value={platform.url}
                    onChange={(e) => updateSellingPlatform(index, 'url', e.target.value)}
                    placeholder="https://example.com"
                    disabled={mode === 'view'}
                  />
                </div>
                {mode !== 'view' && (
                  <Button
                    type="button"
                    onClick={() => removeSellingPlatform(index)}
                    variant="outlined"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Status */}
        {mode === 'edit' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Status
            </h3>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={watch('isActive')}
                onCheckedChange={(checked) => setValue('isActive', checked as boolean)}
                disabled={mode === 'view'}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outlined"
            onClick={handleCancel}
            className="px-6 py-2"
          >
            Cancel
          </Button>
          {mode !== 'view' && (
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2"
            >
              {isSubmitting 
                ? (mode === 'edit' ? 'Updating...' : 'Creating...') 
                : (mode === 'edit' ? 'Update Brand' : 'Create Brand')
              }
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default BrandForm;
