import { ToggleGroup } from "@/core/components/ui/toggle-group";
import type { SurveyQuestion } from "@/core/types/research.type";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";

type OptionsToggleProps = {
  options: SurveyQuestion["options"];
  value?: string;
  onValueChange?: (value: string) => void;
};

const OptionsToggle = ({
  options,
  value,
  onValueChange,
}: OptionsToggleProps) => {
  return (
    <ToggleGroup
      type={"single"}
      className="w-full flex-col items-start justify-center gap-3"
      value={value}
      onValueChange={onValueChange}
    >
      {options.map((radio) => (
        <ToggleGroupPrimitive.Item
          key={radio}
          value={radio}
          data-slot="toggle-group-item"
          className="data-[state=on]:border-primary data-[state=on]:[&_svg]:fill-primary data-[state=on]:ring-primary relative flex w-full items-center justify-start gap-2 rounded-lg border px-3 py-2 text-left transition-all active:scale-98 data-[state=on]:ring-2 [&>svg]:fill-transparent"
        >
          <div className="grid size-4 place-content-center rounded-full border p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="10"
              height="10"
              viewBox="0 0 10 10"
              className="size-3 fill-transparent"
            >
              <circle cx="5" cy="5" r="4" />
            </svg>
          </div>
          {radio}
        </ToggleGroupPrimitive.Item>
      ))}
    </ToggleGroup>
  );
};

export default OptionsToggle;
