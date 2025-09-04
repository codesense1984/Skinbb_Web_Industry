import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '@/core/components/ui/button'
import { PageContent } from '@/core/components/ui/structure'
import { SelectRoot, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'

import { PANEL_ROUTES } from '@/modules/panel/routes/constant'
import { api } from '@/core/services/http'
import { ENDPOINTS } from '@/modules/panel/config/endpoint.config'
import { 
    apiGetBrandsForDropdown, 
    apiGetCategoriesForDropdown, 
    apiGetVariationTypes,
    apiGetMarketedBy,
    apiGetManufacturedBy,
    apiGetImportedBy,
    apiGetProductAttributeValues
} from '@/modules/panel/services/http/product.service'

interface ProductCreateData {
    productName: string;
    slug: string;
    status: 'draft' | 'publish';
    price: number;
    salePrice: number;
    quantity: number;
    brand: string;
    productVariationType: string;
    productCategory: string[];
    marketedBy?: string;
    manufacturedBy?: string;
    importedBy?: string;
    // Product Attributes
    targetConcerns?: string[]; // 685545232be6a9f5abc15be4
    productFeatures?: string[]; // 685544f12be6a9f5abc15bdd
    countryOfOrigin?: string; // 685544632be6a9f5abc15bd4
    benefits?: string[]; // 6855428336d659329f72b94e
    certifications?: string[]; // 685546332be6a9f5abc15bfb
    productForm?: string; // 685545f42be6a9f5abc15bf4
    gender?: string; // 6855458b2be6a9f5abc15bed
    productType?: string; // 6855480a2be6a9f5abc15c32
    targetArea?: string; // 685547d62be6a9f5abc15c2b
    // Additional Attributes
    finish?: string; // 685547af2be6a9f5abc15c26
    fragrance?: string; // 6855478e2be6a9f5abc15c1f
    skinConcerns?: string[]; // 685547672be6a9f5abc15c1a
    hairType?: string; // 685547372be6a9f5abc15c13
    skinType?: string; // 685547232be6a9f5abc15c0c
    capturedDate: string;
}

interface DropdownOption {
    _id: string;
    name?: string;
    label?: string;
    slug?: string;
    address?: string;
}

const ProductCreate = () => {
    const navigate = useNavigate()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isDragOver, setIsDragOver] = useState(false)
    const [uploadedImages, setUploadedImages] = useState<File[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)
    
    // Dropdown data states
    const [brands, setBrands] = useState<DropdownOption[]>([])
    const [categories, setCategories] = useState<DropdownOption[]>([])
    const [variationTypes, setVariationTypes] = useState<DropdownOption[]>([])
    const [marketedBy, setMarketedBy] = useState<DropdownOption[]>([])
    const [manufacturedBy, setManufacturedBy] = useState<DropdownOption[]>([])
    const [importedBy, setImportedBy] = useState<DropdownOption[]>([])
    
    // Product Attribute states
    const [targetConcerns, setTargetConcerns] = useState<DropdownOption[]>([])
    const [productFeatures, setProductFeatures] = useState<DropdownOption[]>([])
    const [countryOfOrigin, setCountryOfOrigin] = useState<DropdownOption[]>([])
    const [benefits, setBenefits] = useState<DropdownOption[]>([])
    const [certifications, setCertifications] = useState<DropdownOption[]>([])
    const [productForm, setProductForm] = useState<DropdownOption[]>([])
    const [gender, setGender] = useState<DropdownOption[]>([])
    const [productType, setProductType] = useState<DropdownOption[]>([])
    const [targetArea, setTargetArea] = useState<DropdownOption[]>([])
    // Additional Attribute states
    const [finish, setFinish] = useState<DropdownOption[]>([])
    const [fragrance, setFragrance] = useState<DropdownOption[]>([])
    const [skinConcerns, setSkinConcerns] = useState<DropdownOption[]>([])
    const [hairType, setHairType] = useState<DropdownOption[]>([])
    const [skinType, setSkinType] = useState<DropdownOption[]>([])
    
    // Form data state
    const [formData, setFormData] = useState<ProductCreateData>({
        productName: '',
        slug: '',
        status: 'draft',
        price: 0,
        salePrice: 0,
        quantity: 0,
        brand: '',
        productVariationType: '',
        productCategory: [],
        marketedBy: '',
        manufacturedBy: '',
        importedBy: '',
        // Product Attributes
        targetConcerns: [],
        productFeatures: [],
        countryOfOrigin: '',
        benefits: [],
        certifications: [],
        productForm: '',
        gender: '',
        productType: '',
        targetArea: '',
        // Additional Attributes
        finish: '',
        fragrance: '',
        skinConcerns: [],
        hairType: '',
        skinType: '',
        capturedDate: new Date().toISOString(),
    })

    // Load dropdown data on component mount
    useEffect(() => {
        const loadDropdownData = async () => {
            try {
                const [
                    brandsRes,
                    categoriesRes,
                    variationTypesRes,
                    marketedByRes,
                    manufacturedByRes,
                    importedByRes,
                    // Product Attributes
                    targetConcernsRes,
                    productFeaturesRes,
                    countryOfOriginRes,
                    benefitsRes,
                    certificationsRes,
                    productFormRes,
                    genderRes,
                    productTypeRes,
                    targetAreaRes,
                    // Additional Attributes
                    finishRes,
                    fragranceRes,
                    skinConcernsRes,
                    hairTypeRes,
                    skinTypeRes
                ] = await Promise.all([
                    apiGetBrandsForDropdown({ page: 1, limit: 50 }),
                    apiGetCategoriesForDropdown({ page: 1, limit: 50, parentCategory: 'all' }),
                    apiGetVariationTypes(),
                    apiGetMarketedBy({ page: 1, limit: 50 }),
                    apiGetManufacturedBy({ page: 1, limit: 50 }),
                    apiGetImportedBy({ page: 1, limit: 50 }),
                    // Product Attributes
                    apiGetProductAttributeValues('685545232be6a9f5abc15be4'), // Target Concerns
                    apiGetProductAttributeValues('685544f12be6a9f5abc15bdd'), // Product Features
                    apiGetProductAttributeValues('685544632be6a9f5abc15bd4'), // Country of Origin
                    apiGetProductAttributeValues('6855428336d659329f72b94e'), // Benefits
                    apiGetProductAttributeValues('685546332be6a9f5abc15bfb'), // Certifications
                    apiGetProductAttributeValues('685545f42be6a9f5abc15bf4'), // Product Form
                    apiGetProductAttributeValues('6855458b2be6a9f5abc15bed'), // Gender
                    apiGetProductAttributeValues('6855480a2be6a9f5abc15c32'), // Product Type
                    apiGetProductAttributeValues('685547d62be6a9f5abc15c2b'), // Target Area
                    // Additional Attributes
                    apiGetProductAttributeValues('685547af2be6a9f5abc15c26'), // Finish
                    apiGetProductAttributeValues('6855478e2be6a9f5abc15c1f'), // Fragrance
                    apiGetProductAttributeValues('685547672be6a9f5abc15c1a'), // Skin Concerns
                    apiGetProductAttributeValues('685547372be6a9f5abc15c13'), // Hair Type
                    apiGetProductAttributeValues('685547232be6a9f5abc15c0c')  // Skin Type
                ])

                // Basic dropdowns
                if (brandsRes.success) setBrands(brandsRes.data.brands)
                if (categoriesRes.success) setCategories(categoriesRes.data.productCategories)
                if (variationTypesRes.success) setVariationTypes(variationTypesRes.data.productVariationTypes)
                if (marketedByRes.success) setMarketedBy(marketedByRes.data.marketedBy)
                if (manufacturedByRes.success) setManufacturedBy(manufacturedByRes.data.manufacturedBy)
                if (importedByRes.success) setImportedBy(importedByRes.data.importedBys)
                
                // Product Attributes
                if (targetConcernsRes.success) setTargetConcerns(targetConcernsRes.data.productAttributeValues)
                if (productFeaturesRes.success) setProductFeatures(productFeaturesRes.data.productAttributeValues)
                if (countryOfOriginRes.success) setCountryOfOrigin(countryOfOriginRes.data.productAttributeValues)
                if (benefitsRes.success) setBenefits(benefitsRes.data.productAttributeValues)
                if (certificationsRes.success) setCertifications(certificationsRes.data.productAttributeValues)
                if (productFormRes.success) setProductForm(productFormRes.data.productAttributeValues)
                if (genderRes.success) setGender(genderRes.data.productAttributeValues)
                if (productTypeRes.success) setProductType(productTypeRes.data.productAttributeValues)
                if (targetAreaRes.success) setTargetArea(targetAreaRes.data.productAttributeValues)
                // Additional Attributes
                if (finishRes.success) setFinish(finishRes.data.productAttributeValues)
                if (fragranceRes.success) setFragrance(fragranceRes.data.productAttributeValues)
                if (skinConcernsRes.success) setSkinConcerns(skinConcernsRes.data.productAttributeValues)
                if (hairTypeRes.success) setHairType(hairTypeRes.data.productAttributeValues)
                if (skinTypeRes.success) setSkinType(skinTypeRes.data.productAttributeValues)
            } catch (error) {
                console.error('Failed to load dropdown data:', error)
            }
        }

        loadDropdownData()
    }, [])

    const handleInputChange = (field: keyof ProductCreateData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Submitted values', formData)
        console.log('Uploaded images', uploadedImages)
        setIsSubmitting(true)
        setError(null)

        try {
            // Create FormData to handle file uploads
            const submitData = new FormData()
            
            // Add form data
            Object.entries(formData).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    value.forEach(item => submitData.append(`${key}[]`, item))
                } else if (value !== null && value !== undefined) {
                    submitData.append(key, value.toString())
                }
            })
            
            // Add uploaded images
            uploadedImages.forEach((file) => {
                submitData.append('images', file)
            })
            
            const result = await api.post(ENDPOINTS.PRODUCT.MAIN, submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }) as { success: boolean; message?: string }
            
            if (result.success) {
                console.log('Product created successfully:', result.message)
                // Navigate back to product list
                navigate(PANEL_ROUTES.LISTING.LIST)
            }
        } catch (error: any) {
            console.error('Failed to create product:', error)
            setError(error?.response?.data?.message || error?.message || 'Failed to create product. Please check your input and try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancel = () => {
        navigate(PANEL_ROUTES.LISTING.LIST)
    }

    // Image upload functions
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
        
        const files = Array.from(e.dataTransfer.files)
        const imageFiles = files.filter(file => file.type.startsWith('image/'))
        
        if (imageFiles.length + uploadedImages.length > 10) {
            setError('Maximum 10 images allowed')
            return
        }
        
        // Check file size (10MB limit)
        const oversizedFiles = imageFiles.filter(file => file.size > 10 * 1024 * 1024)
        if (oversizedFiles.length > 0) {
            setError('Some files exceed 10MB limit')
            return
        }
        
        setUploadedImages(prev => [...prev, ...imageFiles])
        setError(null)
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        const imageFiles = files.filter(file => file.type.startsWith('image/'))
        
        if (imageFiles.length + uploadedImages.length > 10) {
            setError('Maximum 10 images allowed')
            return
        }
        
        // Check file size (10MB limit)
        const oversizedFiles = imageFiles.filter(file => file.size > 10 * 1024 * 1024)
        if (oversizedFiles.length > 0) {
            setError('Some files exceed 10MB limit')
            return
        }
        
        setUploadedImages(prev => [...prev, ...imageFiles])
        setError(null)
    }

    const removeImage = (index: number) => {
        setUploadedImages(prev => prev.filter((_, i) => i !== index))
    }

    const openFileDialog = () => {
        fileInputRef.current?.click()
    }

    return (
        <PageContent
            header={{
                title: "Create Product",
                description: "Add a new product to your catalog.",
            }}
        >
            <div className="max-w-5xl mx-auto">
                <div className="bg-background rounded-xl border shadow-sm p-8">
                    <form onSubmit={handleFormSubmit}>
                        <div className="space-y-8">
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                    <div className="text-sm text-red-800">
                                        <strong>Error:</strong> {error}
                                    </div>
                                </div>
                            )}
                            
                            {/* Basic Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Basic Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="productName" className="text-sm font-medium text-gray-700">Product Name *</Label>
                                    <Input
                                        id="productName"
                                        value={formData.productName}
                                        onChange={(e) => handleInputChange('productName', e.target.value)}
                                        placeholder="Enter product name"
                                        required
                                        className="h-10"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="slug" className="text-sm font-medium text-gray-700">Slug *</Label>
                                    <Input
                                        id="slug"
                                        value={formData.slug}
                                        onChange={(e) => handleInputChange('slug', e.target.value)}
                                        placeholder="product-slug"
                                        required
                                        className="h-10"
                                    />
                                </div>
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Pricing & Inventory</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="price" className="text-sm font-medium text-gray-700">Price *</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                                        placeholder="0.00"
                                        required
                                        className="h-10"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="salePrice" className="text-sm font-medium text-gray-700">Sale Price</Label>
                                    <Input
                                        id="salePrice"
                                        type="number"
                                        step="0.01"
                                        value={formData.salePrice}
                                        onChange={(e) => handleInputChange('salePrice', parseFloat(e.target.value) || 0)}
                                        placeholder="0.00"
                                        className="h-10"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="quantity" className="text-sm font-medium text-gray-700">Quantity *</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        value={formData.quantity}
                                        onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                                        placeholder="0"
                                        required
                                        className="h-10"
                                    />
                                </div>
                                </div>
                            </div>

                            {/* Product Details */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Product Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="brand" className="text-sm font-medium text-gray-700">Brand *</Label>
                                    <SelectRoot value={formData.brand} onValueChange={(value) => handleInputChange('brand', value)}>
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="Select a brand" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {brands.map((brand) => (
                                                <SelectItem key={brand._id} value={brand._id}>
                                                    {brand.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </SelectRoot>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="productVariationType" className="text-sm font-medium text-gray-700">Variation Type *</Label>
                                    <SelectRoot value={formData.productVariationType} onValueChange={(value) => handleInputChange('productVariationType', value)}>
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="Select variation type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {variationTypes.map((type) => (
                                                <SelectItem key={type._id} value={type._id}>
                                                    {type.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </SelectRoot>
                                </div>
                                </div>

                                {/* Category */}
                                <div className="space-y-2">
                                    <Label htmlFor="productCategory" className="text-sm font-medium text-gray-700">Category *</Label>
                                    <SelectRoot value={formData.productCategory[0] || ''} onValueChange={(value) => handleInputChange('productCategory', [value])}>
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category._id} value={category._id}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </SelectRoot>
                                </div>

                                {/* Status */}
                                <div className="space-y-2">
                                    <Label htmlFor="status" className="text-sm font-medium text-gray-700">Status *</Label>
                                    <SelectRoot value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="publish">Publish</SelectItem>
                                        </SelectContent>
                                    </SelectRoot>
                                </div>
                            </div>

                            {/* Optional Fields */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Company Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="marketedBy">Marketed By</Label>
                                    <SelectRoot value={formData.marketedBy || ''} onValueChange={(value) => handleInputChange('marketedBy', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select marketed by" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {marketedBy.map((item) => (
                                                <SelectItem key={item._id} value={item._id}>
                                                    {item.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </SelectRoot>
                                </div>

                                <div>
                                    <Label htmlFor="manufacturedBy">Manufactured By</Label>
                                    <SelectRoot value={formData.manufacturedBy || ''} onValueChange={(value) => handleInputChange('manufacturedBy', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select manufactured by" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {manufacturedBy.map((item) => (
                                                <SelectItem key={item._id} value={item._id}>
                                                    {item.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </SelectRoot>
                                </div>
                                </div>

                                <div>
                                    <Label htmlFor="importedBy">Imported By</Label>
                                    <SelectRoot value={formData.importedBy || ''} onValueChange={(value) => handleInputChange('importedBy', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select imported by" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {importedBy.map((item) => (
                                                <SelectItem key={item._id} value={item._id}>
                                                    {item.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </SelectRoot>
                                </div>
                            </div>

                            {/* Product Attributes Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Product Attributes</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="countryOfOrigin">Country of Origin</Label>
                                        <SelectRoot value={formData.countryOfOrigin || ''} onValueChange={(value) => handleInputChange('countryOfOrigin', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select country of origin" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {countryOfOrigin.map((item) => (
                                                    <SelectItem key={item._id} value={item._id}>
                                                        {item.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </SelectRoot>
                                    </div>

                                    <div>
                                        <Label htmlFor="productForm">Product Form</Label>
                                        <SelectRoot value={formData.productForm || ''} onValueChange={(value) => handleInputChange('productForm', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select product form" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {productForm.map((item) => (
                                                    <SelectItem key={item._id} value={item._id}>
                                                        {item.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </SelectRoot>
                                    </div>

                                    <div>
                                        <Label htmlFor="gender">Gender</Label>
                                        <SelectRoot value={formData.gender || ''} onValueChange={(value) => handleInputChange('gender', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {gender.map((item) => (
                                                    <SelectItem key={item._id} value={item._id}>
                                                        {item.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </SelectRoot>
                                    </div>

                                    <div>
                                        <Label htmlFor="productType">Product Type</Label>
                                        <SelectRoot value={formData.productType || ''} onValueChange={(value) => handleInputChange('productType', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select product type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {productType.map((item) => (
                                                    <SelectItem key={item._id} value={item._id}>
                                                        {item.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </SelectRoot>
                                    </div>

                                    <div>
                                        <Label htmlFor="targetArea">Target Area</Label>
                                        <SelectRoot value={formData.targetArea || ''} onValueChange={(value) => handleInputChange('targetArea', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select target area" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {targetArea.map((item) => (
                                                    <SelectItem key={item._id} value={item._id}>
                                                        {item.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </SelectRoot>
                                    </div>

                                    <div>
                                        <Label htmlFor="finish">Finish</Label>
                                        <SelectRoot value={formData.finish || ''} onValueChange={(value) => handleInputChange('finish', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select finish" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {finish.map((item) => (
                                                    <SelectItem key={item._id} value={item._id}>
                                                        {item.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </SelectRoot>
                                    </div>

                                    <div>
                                        <Label htmlFor="fragrance">Fragrance</Label>
                                        <SelectRoot value={formData.fragrance || ''} onValueChange={(value) => handleInputChange('fragrance', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select fragrance" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {fragrance.map((item) => (
                                                    <SelectItem key={item._id} value={item._id}>
                                                        {item.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </SelectRoot>
                                    </div>

                                    <div>
                                        <Label htmlFor="hairType">Hair Type</Label>
                                        <SelectRoot value={formData.hairType || ''} onValueChange={(value) => handleInputChange('hairType', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select hair type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {hairType.map((item) => (
                                                    <SelectItem key={item._id} value={item._id}>
                                                        {item.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </SelectRoot>
                                    </div>

                                    <div>
                                        <Label htmlFor="skinType">Skin Type</Label>
                                        <SelectRoot value={formData.skinType || ''} onValueChange={(value) => handleInputChange('skinType', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select skin type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {skinType.map((item) => (
                                                    <SelectItem key={item._id} value={item._id}>
                                                        {item.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </SelectRoot>
                                    </div>
                                </div>

                                {/* Multi-select attributes */}
                                <div className="mt-6 space-y-4">
                                    <div>
                                        <Label>Target Concerns</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                                            {targetConcerns.map((concern) => (
                                                <label key={concern._id} className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.targetConcerns?.includes(concern._id) || false}
                                                        onChange={(e) => {
                                                            const current = formData.targetConcerns || [];
                                                            if (e.target.checked) {
                                                                handleInputChange('targetConcerns', [...current, concern._id]);
                                                            } else {
                                                                handleInputChange('targetConcerns', current.filter(id => id !== concern._id));
                                                            }
                                                        }}
                                                        className="rounded"
                                                    />
                                                    <span className="text-sm">{concern.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Product Features</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                                            {productFeatures.map((feature) => (
                                                <label key={feature._id} className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.productFeatures?.includes(feature._id) || false}
                                                        onChange={(e) => {
                                                            const current = formData.productFeatures || [];
                                                            if (e.target.checked) {
                                                                handleInputChange('productFeatures', [...current, feature._id]);
                                                            } else {
                                                                handleInputChange('productFeatures', current.filter(id => id !== feature._id));
                                                            }
                                                        }}
                                                        className="rounded"
                                                    />
                                                    <span className="text-sm">{feature.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Benefits</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                                            {benefits.map((benefit) => (
                                                <label key={benefit._id} className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.benefits?.includes(benefit._id) || false}
                                                        onChange={(e) => {
                                                            const current = formData.benefits || [];
                                                            if (e.target.checked) {
                                                                handleInputChange('benefits', [...current, benefit._id]);
                                                            } else {
                                                                handleInputChange('benefits', current.filter(id => id !== benefit._id));
                                                            }
                                                        }}
                                                        className="rounded"
                                                    />
                                                    <span className="text-sm">{benefit.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Certifications</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                                            {certifications.map((cert) => (
                                                <label key={cert._id} className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.certifications?.includes(cert._id) || false}
                                                        onChange={(e) => {
                                                            const current = formData.certifications || [];
                                                            if (e.target.checked) {
                                                                handleInputChange('certifications', [...current, cert._id]);
                                                            } else {
                                                                handleInputChange('certifications', current.filter(id => id !== cert._id));
                                                            }
                                                        }}
                                                        className="rounded"
                                                    />
                                                    <span className="text-sm">{cert.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Skin Concerns</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                                            {skinConcerns.map((concern) => (
                                                <label key={concern._id} className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.skinConcerns?.includes(concern._id) || false}
                                                        onChange={(e) => {
                                                            const current = formData.skinConcerns || [];
                                                            if (e.target.checked) {
                                                                handleInputChange('skinConcerns', [...current, concern._id]);
                                                            } else {
                                                                handleInputChange('skinConcerns', current.filter(id => id !== concern._id));
                                                            }
                                                        }}
                                                        className="rounded"
                                                    />
                                                    <span className="text-sm">{concern.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Image Upload Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Images</h3>
                                
                                {/* Upload Area */}
                                <div
                                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                                        isDragOver 
                                            ? 'border-blue-400 bg-blue-50' 
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    <div className="flex flex-col items-center space-y-4">
                                        {/* Upload Icon */}
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        
                                        {/* Upload Text */}
                                        <div className="space-y-2">
                                            <p className="text-gray-600">
                                                Drop image here or{' '}
                                                <button
                                                    type="button"
                                                    onClick={openFileDialog}
                                                    className="text-blue-600 hover:text-blue-700 underline"
                                                >
                                                    Click to browse
                                                </button>
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Max 10 image(s) • up to 10MB each • Allowed: image/jpeg, image/png
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* Hidden File Input */}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept="image/jpeg,image/png"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                </div>

                                {/* Uploaded Images Preview */}
                                {uploadedImages.length > 0 && (
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-medium text-gray-700">Uploaded Images ({uploadedImages.length}/10)</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                            {uploadedImages.map((file, index) => (
                                                <div key={index} className="relative group">
                                                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                                                        <img
                                                            src={URL.createObjectURL(file)}
                                                            alt={`Upload ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                                                    >
                                                        ×
                                                    </button>
                                                    <div className="mt-1 text-xs text-gray-500 truncate">
                                                        {file.name}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-4 pt-8 mt-8 border-t border-gray-200">
                            <Button
                                type="button"
                                    variant="outlined"
                                    onClick={handleCancel}
                                    className="px-6 py-2"
                                >
                                    Cancel
                            </Button>
                            <Button
                                type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2"
                            >
                                    {isSubmitting ? 'Creating...' : 'Create Product'}
                            </Button>
                            </div>
                        </div>
                    </form>
                        </div>
                    </div>
        </PageContent>
    )
}

export default ProductCreate