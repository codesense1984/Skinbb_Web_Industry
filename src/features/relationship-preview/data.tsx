import type { Core, EventObject, LayoutOptions, NodeSingular } from "cytoscape";
import DATA from "./cleaned-data.json";
import type { Option } from "@/core/types";
export type Product = {
  brand_name: string;
  product_name: string;
  all_ingredients: string[];
  product_images: string;
};

export type NodeType = "ingredient" | "product";
export type Node = {
  label: string;
  id: string;
  hasChildren: boolean;
};

const PRODUCT_INGREDIENT = DATA as Product[];
export const relationshipStyle = [
  {
    selector: "node, edge",
    style: {
      opacity: 1,
    },
  },
  {
    selector: "node.ingredient",
    style: {
      shape: "ellipse",
      "background-color": "#ffffff",
      "border-color": "#93aafd",
      "border-width": 3,
      width: 70,
      height: 70,
      "background-image": "url('/flusk.svg')",
      "background-fit": "contain",
      "background-clip": "none",
      "background-opacity": 0,
      label: "data(label)",
      "text-max-width": "100px",
      "text-wrap": "wrap",
      "text-valign": "bottom",
      "text-halign": "center",
      "font-size": 12,
      color: "#333",
      "text-margin-y": 6,
    },
  },
  {
    selector: "node.product",
    style: {
      shape: "diamond",
      "background-color": "#FCE4EC",
      "border-color": "#f08484",
      "border-width": 2,
      width: 80,
      height: 80,
      "background-image": "url('/ingredient.svg')",
      "background-fit": "contain",
      "background-clip": "none",
      "background-opacity": 0,
      label: "data(label)",
      "text-max-width": "100px",
      "text-wrap": "wrap",
      "text-valign": "bottom",
      "text-halign": "center",
      "font-size": 12,
      color: "#333",
      "text-margin-y": 6,
    },
  },
  {
    selector: "edge",
    style: {
      width: 2,
      "line-color": "#ccc",
      "target-arrow-shape": "triangle",
      "target-arrow-color": "#ccc",
      "curve-style": "bezier",
    },
  },
  {
    selector: "node.highlighted",
    style: {
      "overlay-color": "#1e1b39",
      "overlay-padding": 5,
      //   "overlay-radius": 10,
      "overlay-opacity": 0.1,
      // shape: "ellipse",
      "transition-property": "border-width, border-color, shape",
      "transition-duration": "100ms",
    },
  },
  {
    selector: "node.ingredient.has-children",
    style: {
      "border-color": "#93aafd",
      "border-width": 4,
      "border-opacity": 1,
      "overlay-opacity": 0,
      "border-style": "double",
    },
  },
  {
    selector: "node.product.has-children",
    style: {
      "border-color": "#f08484",
      "border-width": 4,
      "border-opacity": 1,
      "overlay-opacity": 0,
      "border-style": "double",
    },
  },
];

export type relationshipLayoutsProps = ({
  id,
}: {
  id?: string;
}) => LayoutOptions;

export const relationshipLayouts: Record<
  LayoutOptions["name"],
  relationshipLayoutsProps
> = {
  concentric: () => ({
    name: "concentric",
    fit: false,
    animate: true,
    animationDuration: 500,
    animationEasing: "ease-in-out",
    padding: 50,
    startAngle: (3 / 2) * Math.PI,
    spacingFactor: 1.25,
    avoidOverlap: true,
    concentric: (node) => node.degree(),
    levelWidth: () => 2,
  }),
  cose: () => ({
    name: "cose",
    animate: true,
    animationDuration: 500,
    animationEasing: "ease-in-out",
    fit: false,
    padding: 50,
    nodeRepulsion: 400000,
    idealEdgeLength: 100,
    edgeElasticity: 100,
    gravity: 80,
    numIter: 1000,
    initialTemp: 200,
    coolingFactor: 0.95,
    componentSpacing: 100,
    nestingFactor: 5,
  }),
  breadthfirst: ({ id }) => ({
    name: "breadthfirst",
    fit: false, // Do not auto-zoom on layout
    directed: false, // Allows branching instead of flattening
    padding: 50, // Adds breathing room
    spacingFactor: 1.75, // Controls distance between nodes
    avoidOverlap: true, // Prevents overlapping nodes
    circle: false, // Tree-style layout
    animate: true, // Smooth transitions
    animationDuration: 500,
    animationEasing: "ease-in-out",
    roots: id ? [id] : undefined,
  }),
  circle: () => ({
    name: "circle",
    fit: false,
    animate: true,
    animationDuration: 500,
    animationEasing: "ease-in-out",
    padding: 50,
    spacingFactor: 1.5,
    avoidOverlap: true,
    clockwise: true,
    startAngle: (3 / 2) * Math.PI, // start from top center
  }),
  grid: () => ({
    name: "grid",
    fit: false,
    padding: 50,
    avoidOverlap: true,
    spacingFactor: 1.76,
    animate: true,
    animationDuration: 500,
    animationEasing: "ease-in-out",
    rows: undefined, // Auto-calculate rows
    cols: undefined, // Auto-calculate columns

    // position: (node) => {
    //   const index = parseInt(node.id().replace(/\D/g, ""), 10); // example logic
    //   return {
    //     row: Math.floor(index / 5),
    //     col: index % 5,
    //   };
    // },
  }),
};

export async function fetchData(): Promise<Product[]> {
  return PRODUCT_INGREDIENT;
}

export async function autocompleteIngredient(query: string): Promise<Option[]> {
  const products = await fetchData();
  const ingredientSet = new Set<string>();

  // Collect all ingredients from all products
  products?.forEach((product: Product) => {
    product.all_ingredients.forEach((ingredient: string) => {
      ingredientSet.add(ingredient);
    });
  });

  // Filter by query (case-insensitive substring match)
  const matched = Array.from(ingredientSet).filter((ingredient) =>
    ingredient.toLowerCase().includes(query.toLowerCase()),
  );

  // Map to desired format
  const result: Option[] = matched.map((ingredient) => ({
    label: ingredient,
    value: ingredient,
    hasChildren: true, // since it's found in the dataset
  }));

  return result;
}

export const fetchProductsByIngredient = async (
  ingredientId: string,
): Promise<Node[]> => {
  await new Promise((res) => setTimeout(res, 300));
  const response = PRODUCT_INGREDIENT.filter((product) =>
    product.all_ingredients.some(
      (ing) => ing.toLowerCase() === ingredientId.toLowerCase(),
    ),
  ).map((product) => ({
    id: product.product_name,
    label: product.product_name,
    hasChildren: !!product.all_ingredients.length,
  }));
  console.log("🚀 ~ response  fetchProductsByIngredient:", response);
  return response;
};

export const fetchIngredientsByProduct = async (
  productId: string,
): Promise<Node[]> => {
  await new Promise((res) => setTimeout(res, 300));
  const product = PRODUCT_INGREDIENT.find(
    (p) => p.product_name.toLowerCase() === productId.toLowerCase(),
  );
  const response =
    product?.all_ingredients.map((ingredient) => {
      const hasChildren = PRODUCT_INGREDIENT.some((prod) =>
        prod.all_ingredients.includes(ingredient),
      );
      return { id: ingredient, label: ingredient, hasChildren };
    }) ?? [];
  console.log("🚀 ~ response ~ fetchIngredientsByProduct:", response);
  return response;
};

export const handleTap = async ({
  evt,
  cy,
  layout,
  addNode,
  addEdge,
}: {
  evt: EventObject;
  cy: Core;
  layout: relationshipLayoutsProps;
  addNode: (n: Node, t: NodeType) => Promise<NodeSingular | null>;
  addEdge: (s: string, t: string) => Promise<void>;
}) => {
  const node = evt.target;
  const id = node.id();
  cy.nodes().removeClass("highlighted");
  node.addClass("highlighted");

  const type: NodeType = node.hasClass("ingredient") ? "ingredient" : "product";

  const relatedItems =
    type === "ingredient"
      ? await fetchProductsByIngredient(id)
      : await fetchIngredientsByProduct(id);

  await Promise.all(
    relatedItems.map(async (item) => {
      const nodeType: NodeType =
        type === "ingredient" ? "product" : "ingredient";
      await addNode(item, nodeType);
      await addEdge(id, item.id);
    }),
  );

  node.removeClass("has-children");

  requestAnimationFrame(() => {
    const layoutInstance = cy.layout(layout({ id }));
    layoutInstance.on("layoutstop", () => {
      cy.animate(
        {
          center: { eles: node },
        },
        {
          duration: 500,
          easing: "ease-in-out",
        },
      );
    });
    layoutInstance.run();
  });
};
