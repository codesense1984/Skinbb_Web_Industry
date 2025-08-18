import { GraphControls } from "@/core/components/cytoscape/GraphControls";
import { Button } from "@/core/components/ui/button";
import { ComboBox, type Option } from "@/core/components/ui/combo-box";
import { DropdownMenu } from "@/core/components/ui/dropdown-menu";
import { Tooltip } from "@/core/components/ui/tooltip";
import { useDebounce } from "@/core/hooks/useDebounce";
import { capitalize, cn } from "@/core/utils";
import { CircleStackIcon } from "@heroicons/react/24/outline";
import type {
  Core,
  ElementDefinition,
  EventObject,
  NodeSingular,
} from "cytoscape";
import { useCallback, useEffect, useRef, useState } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import { useSearchParams, type SetURLSearchParams } from "react-router";
import {
  autocompleteIngredient,
  handleTap,
  relationshipLayouts,
  relationshipStyle,
  type Node,
  type NodeType,
} from "./data";

const RelationshipPreview = ({
  className,
  height = "100dvh",
}: {
  className?: string;
  height?: string;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [visibleCyto, setVisibleCyto] = useState<[boolean, Node | undefined]>([
    false,
    undefined,
  ]);

  useEffect(() => {
    const label = searchParams.get("label");
    const id = searchParams.get("id");
    const hasChildren = searchParams.get("hasChildren");
    if (label && id && hasChildren) {
      setVisibleCyto([
        true,
        {
          hasChildren: JSON.parse(hasChildren),
          id,
          label,
        },
      ]);
    }
  }, [searchParams]);

  const reset = () => {
    setVisibleCyto([false, undefined]);
    setSearchParams({});
  };
  return (
    <div
      className={cn(
        "bg-muted relative flex h-full items-center justify-center border inset-shadow-sm",
        className,
      )}
      style={{
        height,
      }}
    >
      {visibleCyto && visibleCyto[1] ? (
        <PreviewCytoscape
          initialNode={visibleCyto[1]}
          height={height}
          reset={reset}
        />
      ) : (
        <SelectIngredient setSearchParams={setSearchParams} />
      )}
    </div>
  );
};

const SelectIngredient = ({
  setSearchParams,
}: {
  setSearchParams: SetURLSearchParams;
}) => {
  const [value, setValue] = useState<string | undefined>(undefined);
  const [options, setOptions] = useState<Option[]>([]);
  const [input, setInput] = useState("");

  const debouncedInput = useDebounce(input, 300);

  useEffect(() => {
    if (debouncedInput.trim() === "" || debouncedInput.length < 3) {
      setOptions([]);
      return;
    }

    autocompleteIngredient(debouncedInput).then((results) => {
      setOptions(results);
    });
  }, [debouncedInput]);

  const handleChange = (val: string, opt: unknown) => {
    const option = opt as Node | undefined;
    setValue(val);

    if (option?.label) {
      setSearchParams({
        id: option.label,
        label: option.label,
        hasChildren: String(option.hasChildren),
      });
    } else {
      setSearchParams(undefined);
    }
  };

  return (
    <ComboBox
      options={options}
      className="max-w-50"
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
  );
};

const PreviewCytoscape = ({
  initialNode,
  height,
  reset,
}: {
  initialNode: Node;
  height: string;
  reset: () => void;
}) => {
  const [elements, setElements] = useState<ElementDefinition[]>([]);
  const [layout, setLayout] =
    useState<keyof typeof relationshipLayouts>("breadthfirst");

  const cyRef = useRef<Core | null>(null);
  const nodeSet = useRef<Set<string>>(new Set());
  const edgeSet = useRef<Set<string>>(new Set());
  const hasLoadedRef = useRef(false);

  const addNode = useCallback(
    async (nodeData: Node, type: NodeType): Promise<NodeSingular | null> => {
      const { id, label, hasChildren } = nodeData;
      if (nodeSet.current.has(id))
        return cyRef.current?.getElementById(id) ?? null;
      nodeSet.current.add(id);

      const finalSize = type === "ingredient" ? 70 : 80;
      const node: ElementDefinition = {
        data: { id, label, width: finalSize, height: finalSize },
        classes: `${type} ${hasChildren ? "has-children" : ""}`.trim(),
      };

      setElements((prev) => [...prev, node]);

      await new Promise((resolve) => setTimeout(resolve, 50));

      const cy = cyRef.current;
      if (!cy) return null;

      for (let i = 0; i < 10; i++) {
        await new Promise((r) => setTimeout(r, 50));
        const ele = cy.getElementById(id);
        if (ele && ele.length > 0) return ele;
      }

      return null;
    },
    [],
  );

  const addEdge = useCallback(
    async (source: string, target: string): Promise<void> => {
      const edgeId = `${source}-${target}`;
      if (edgeSet.current.has(edgeId)) return;
      edgeSet.current.add(edgeId);

      const edge: ElementDefinition = {
        data: { id: edgeId, source, target },
      };

      setElements((prev) => [...prev, edge]);

      await new Promise((resolve) => setTimeout(resolve, 50)); // small wait
    },
    [],
  );

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    const listener = (evt: EventObject) =>
      handleTap({
        evt,
        cy,
        layout: relationshipLayouts[layout],
        addNode,
        addEdge,
      });

    cy.on("tap", "node", listener);

    return () => {
      cy.off("tap", "node", listener);
    };
  }, [addNode, addEdge, layout]);

  useEffect(() => {
    const loadAndCenter = async () => {
      if (initialNode && cyRef.current && !hasLoadedRef.current) {
        const cy = cyRef.current;
        const node = await addNode(initialNode, "ingredient");
        if (node) {
          hasLoadedRef.current = true;
          await new Promise((resolve) => setTimeout(resolve, 150));
          cy.layout(relationshipLayouts[layout]({ id: node.id() })).run();
        }
      }
    };

    loadAndCenter();
  }, [addNode, initialNode, layout]);

  useEffect(() => {
    cyRef.current?.layout(relationshipLayouts[layout]({})).run();
  }, [layout]);

  return (
    <>
      {cyRef.current && (
        <GraphControls
          cy={cyRef.current}
          layout={relationshipLayouts[layout]({})}
        >
          <hr />
          <DropdownMenu
            label="Layout"
            items={Object.entries(relationshipLayouts).map(([key]) => ({
              children: capitalize(key),
              type: "checkbox",
              checked: layout === key,
              onCheckedChange: () => {
                setLayout(key as keyof typeof relationshipLayouts);
              },
            }))}
            asChild
          >
            <Button size="icon" startIcon={<CircleStackIcon />}></Button>
          </DropdownMenu>
          <hr />
          <Tooltip title="Reset Ingredient" side="left">
            <Button
              size="icon"
              onClick={reset}
              startIcon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                  data-slot="icon"
                  fill="none"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12.252 6v6h4.5"
                  ></path>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.887 5.636A9 8.996 45 0 1 16.75 4.208a9 8.996 45 0 1 4.194 10.123 9 8.996 45 0 1-8.69 6.667 9 8.996 45 0 1-8.693-6.67m2.327-8.692L3.38 8.143M3.363 3.15v5.013m0 0h5.013"
                  ></path>
                </svg>
              }
            />
          </Tooltip>
        </GraphControls>
      )}

      <div className="bg-background absolute top-2 right-2 z-1 max-w-70 rounded-md border p-2 shadow-md sm:max-w-full">
        <ul className="flex flex-wrap gap-4 text-sm">
          <li className="flex items-center gap-2">
            <span className="block size-3 rounded-full border-2 border-[#93aafd]"></span>{" "}
            Ingredient
          </li>
          <li className="flex items-center gap-2">
            <span className="block size-2.5 rotate-45 border-2 border-[#f08484]"></span>{" "}
            Product
          </li>
          <li className="flex items-center gap-2">
            <span className="block size-3 rounded-full border-2 border-double border-[#f08484]"></span>{" "}
            Has Product
          </li>
          <li className="flex items-center gap-2">
            <span className="block size-3 rounded-full border-2 border-double border-[#93aafd]"></span>{" "}
            Has Ingredient
          </li>
        </ul>
      </div>

      <CytoscapeComponent
        elements={CytoscapeComponent.normalizeElements(elements)}
        zoom={1}
        panningEnabled={true}
        cy={(cy: Core) => {
          cyRef.current = cy;
        }}
        minZoom={0.4}
        maxZoom={2}
        style={{ width: "100%", height }}
        stylesheet={relationshipStyle}
      />
    </>
  );
};

export default RelationshipPreview;
