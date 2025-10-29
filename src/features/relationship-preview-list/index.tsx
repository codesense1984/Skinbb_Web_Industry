import { Button } from "@/core/components/ui/button";
import { ComboBox } from "@/core/components/ui/combo-box";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/core/components/ui/table";
import { useDebounce } from "@/core/hooks/useDebounce";
import { cn } from "@/core/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { autocompleteIngredient, fetchProductsByIngredient, fetchIngredientsByProduct, type Node } from "./data";
import type { Option } from "@/core/types";

interface RelationshipPreviewListProps {
  className?: string;
  height?: string;
}

type Level = 0 | 1 | 2;

interface NavigationState {
  level: Level;
  selectedIngredient: Node | null;
  selectedProduct: Node | null;
  products: Node[];
  ingredients: Node[];
}

const RelationshipPreviewList = ({ className, height = "100dvh" }: RelationshipPreviewListProps) => {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    level: 0,
    selectedIngredient: null,
    selectedProduct: null,
    products: [],
    ingredients: []
  });


  const handleIngredientSelect = async (ingredient: Node) => {
    console.log("🚀 ~ handleIngredientSelect ~ ingredient:", ingredient);
    console.log("🚀 ~ handleIngredientSelect ~ ingredient.id:", ingredient.id);
    console.log("🚀 ~ handleIngredientSelect ~ ingredient.label:", ingredient.label);
    
    // Use label as id if id is undefined
    const ingredientId = ingredient.id || ingredient.label;
    console.log("🚀 ~ handleIngredientSelect ~ using ingredientId:", ingredientId);
    
    const products = await fetchProductsByIngredient(ingredientId);
    console.log("🚀 ~ handleIngredientSelect ~ products:", products);
    setNavigationState({
      level: 1,
      selectedIngredient: ingredient,
      selectedProduct: null,
      products,
      ingredients: []
    });
  };

  const handleProductSelect = async (product: Node) => {
    const ingredients = await fetchIngredientsByProduct(product.id);
    setNavigationState(prev => ({
      ...prev,
      level: 2,
      selectedProduct: product,
      ingredients
    }));
  };

  const handlePrevious = () => {
    if (navigationState.level === 2) {
      setNavigationState(prev => ({
        ...prev,
        level: 1,
        selectedProduct: null,
        ingredients: []
      }));
    } else if (navigationState.level === 1) {
      setNavigationState(prev => ({
        ...prev,
        level: 0,
        selectedIngredient: null,
        products: [],
        ingredients: []
      }));
    }
  };

  const handleNext = () => {
    if (navigationState.level === 0 && navigationState.selectedIngredient) {
      setNavigationState(prev => ({
        ...prev,
        level: 1
      }));
    } else if (navigationState.level === 1 && navigationState.selectedProduct) {
      setNavigationState(prev => ({
        ...prev,
        level: 2
      }));
    }
  };

  const canGoPrevious = navigationState.level > 0;
  const canGoNext = 
    (navigationState.level === 0 && navigationState.selectedIngredient) ||
    (navigationState.level === 1 && navigationState.selectedProduct);

  console.log("🚀 ~ RelationshipPreviewList ~ navigationState:", navigationState);
  
  return (
    <div
      className={cn(
        "bg-muted relative flex h-full flex-col border inset-shadow-sm",
        className
      )}
      style={{ height }}
    >
      {/* Header with Navigation */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            Level {navigationState.level}: {
              navigationState.level === 0 ? "Select Ingredient" :
              navigationState.level === 1 ? "Products" :
              "Ingredients"
            }
          </span>
          {navigationState.selectedIngredient && (
            <span className="text-xs text-muted-foreground">
              → {navigationState.selectedIngredient.label}
            </span>
          )}
          {navigationState.selectedProduct && (
            <span className="text-xs text-muted-foreground">
              → {navigationState.selectedProduct.label}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outlined"
            size="sm"
            onClick={handlePrevious}
            disabled={!canGoPrevious}
            startIcon={<ChevronLeftIcon className="h-4 w-4" />}
          >
            Previous
          </Button>
          <Button
            variant="outlined"
            size="sm"
            onClick={handleNext}
            disabled={!canGoNext}
            endIcon={<ChevronRightIcon className="h-4 w-4" />}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {navigationState.level === 0 ? (
          <IngredientSelector onSelect={handleIngredientSelect} />
        ) : (
          <div className="h-full flex">
            {/* Level 1: Selected Ingredient */}
            {navigationState.selectedIngredient && (
              <div className="flex-1 border-r">
                <div className="p-4 h-full">
                  <h3 className="text-lg font-semibold mb-4">Selected Ingredient</h3>
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <div className="text-lg font-medium">{navigationState.selectedIngredient.label}</div>
                    <div className="text-sm text-muted-foreground mt-2">
                      {navigationState.products.length} products found
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Connector Arrow */}
            {navigationState.level >= 1 && (
              <div className="flex items-center justify-center px-2">
                <div className="flex items-center">
                  <div className="w-12 h-0.5 bg-primary"></div>
                  <div className="w-0 h-0 border-l-4 border-l-primary border-t-4 border-t-transparent border-b-4 border-b-transparent ml-1"></div>
                </div>
              </div>
            )}

            {/* Level 1: Products Table */}
            {navigationState.level >= 1 && (
              <div className="flex-1 border-r">
                <div className="p-4 h-full">
                  <h3 className="text-lg font-semibold mb-4">Products</h3>
                  {navigationState.selectedProduct && (
                    <div className="mb-4">
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4">
                        <div className="text-sm font-medium">Selected Product</div>
                        <div className="text-lg font-medium">{navigationState.selectedProduct.label}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {navigationState.ingredients.length} ingredients found
                        </div>
                      </div>
                    </div>
                  )}
                  <ProductsTable 
                    products={navigationState.products}
                    onProductSelect={handleProductSelect}
                    selectedProduct={navigationState.selectedProduct}
                  />
                </div>
              </div>
            )}

            {/* Connector Arrow for Level 2 */}
            {navigationState.level >= 2 && navigationState.selectedProduct && (
              <div className="flex items-center justify-center px-2">
                <div className="flex items-center">
                  <div className="w-12 h-0.5 bg-primary"></div>
                  <div className="w-0 h-0 border-l-4 border-l-primary border-t-4 border-t-transparent border-b-4 border-b-transparent ml-1"></div>
                </div>
              </div>
            )}

            {/* Level 2: Ingredients Table */}
            {navigationState.level >= 2 && navigationState.selectedProduct && (
              <div className="flex-1">
                <div className="p-4 h-full">
                  <h3 className="text-lg font-semibold mb-4">Ingredients</h3>
                  <IngredientsTable ingredients={navigationState.ingredients} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const IngredientSelector = ({ onSelect }: { onSelect: (ingredient: Node) => void }) => {
  const [value, setValue] = useState<string | undefined>(undefined);
  const [options, setOptions] = useState<Option[]>([]);
  const [input, setInput] = useState("");

  const debouncedInput = useDebounce(input, 300);

  // Handle auto-selection when value and options are available
  useEffect(() => {
    if (value && options.length > 0) {
      const selectedOption = options.find(opt => opt.value === value);
      if (selectedOption) {
        console.log("🚀 ~ useEffect ~ auto-selecting:", selectedOption);
        // Use setTimeout to avoid infinite loops
        setTimeout(() => {
          // Convert Option to Node by ensuring all required properties are present
          const node: Node = {
            label: selectedOption.label as string,
            id: selectedOption.value,
            hasChildren: Boolean(selectedOption.hasChildren) || true, // Default to true if not specified
          };
          onSelect(node);
        }, 100);
      }
    }
  }, [value, options, onSelect]);

  useEffect(() => {
    if (debouncedInput.trim() === "" || debouncedInput.length < 3) {
      setOptions([]);
      return;
    }

    autocompleteIngredient(debouncedInput).then((results: Option[]) => {
      setOptions(results);
    });
  }, [debouncedInput]);

  const handleChange = (val: string, opt: unknown) => {
    console.log("🚀 ~ handleChange ~ val:", val, "opt:", opt);
    const option = opt as Node | undefined;
    setValue(val);

    if (option?.label) {
      console.log("🚀 ~ handleChange ~ calling onSelect with:", option);
      onSelect(option);
    }
  };

  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-center">Select an Ingredient</h2>
        <ComboBox
          options={options}
          className="w-full"
          popoverContentProps={{ className: "h-[40dvh]" }}
          value={value}
          placeholder="Search ingredients"
          commandInputProps={{
            onValueChange(search) {
              setInput(search);
            },
          }}
          emptyMessage={
            options.length === 0 && debouncedInput.length >= 3
              ? "No result found."
              : "Please enter at least 3 characters."
          }
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

const ProductsTable = ({ 
  products, 
  onProductSelect, 
  selectedProduct 
}: { 
  products: Node[];
  onProductSelect: (product: Node) => void;
  selectedProduct: Node | null;
}) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead>Product Name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow 
                key={product.id}
                className={cn(
                  "cursor-pointer hover:bg-muted/50",
                  selectedProduct?.id === product.id && "bg-primary/10"
                )}
                onClick={() => onProductSelect(product)}
              >
                <TableCell className="font-medium">{product.label}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {products.length > 0 && (
        <div className="mt-2 text-sm text-muted-foreground text-center">
          {products.length} products found
        </div>
      )}
    </div>
  );
};

const IngredientsTable = ({ ingredients }: { ingredients: Node[] }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead>Ingredient Name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ingredients.map((ingredient) => (
              <TableRow key={ingredient.id}>
                <TableCell className="font-medium">{ingredient.label}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {ingredients.length > 0 && (
        <div className="mt-2 text-sm text-muted-foreground text-center">
          {ingredients.length} ingredients found
        </div>
      )}
    </div>
  );
};

export default RelationshipPreviewList;
