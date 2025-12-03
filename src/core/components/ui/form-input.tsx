import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";
import { useState, useEffect } from "react";
import {
  useFormContext,
  useWatch,
  type Control,
  type ControllerFieldState,
  type ControllerRenderProps,
  type FieldPath,
  type FieldPathValue,
  type FieldValues,
  type PathValue,
  type RegisterOptions,
  type UseFormStateReturn,
} from "react-hook-form";

import { cn, isURL } from "@/core/utils/index";
import type { Mode } from "react-day-picker";
import { Checkbox } from "./checkbox";
import { ComboBox } from "./combo-box";
import { DatePicker, type DatePickerProps } from "./date-picker";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import { Input, type InputProps } from "./input";
import {
  SelectRoot,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  type SelectTriggerProps,
} from "./select";
import { Slider } from "./slider";
import { Textarea, type TextareaProps } from "./textarea";
import { RichTextEditor } from "./rich-text-editor";
import {
  ArrowUpTrayIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { Tooltip } from "./tooltip";
import type { Option } from "@/core/types";
import { Link } from "react-router";

const INPUT_TYPES = {
  TEXT: "text",
  URL: "url",
  EMAIL: "email",
  NUMBER: "number",
  TEXTAREA: "textarea",
  RICH_TEXT: "rich_text",
  CHECKBOX: "checkbox",
  PASSWORD: "password",
  FILE: "file",
  SELECT: "select",
  DATEPICKER: "datepicker",
  SLIDER: "slider",
  COMBOBOX: "combobox",
  CUSTOM: "custom",
} as const;

type TransformType<
  TF,
  TI,
  // TE =
  //   | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  //   | CheckboxPrimitive.CheckedState
  //   | number
  //   | string,
> = {
  input: (value: TF) => TI;
  output: (event: unknown) => TF;
};

interface BaseInputProps<
  T extends FieldValues,
  N extends FieldPath<T>,
  TF = FieldPathValue<T, N>,
  TI = TF,
> extends React.ComponentProps<"div"> {
  control: Control<T>;
  name: N;
  label?: string | React.ReactElement;
  description?: string;
  placeholder?: string;
  rules?: RegisterOptions<T, N>;
  formControlProps?: React.HTMLAttributes<HTMLDivElement>;
  disabled?: boolean;
  readOnly?: boolean;
  transform?: TransformType<TF, TI>;
  required?: boolean;
  note?: string | React.ReactNode;
}

type StandardInputProps = InputProps &
  TextareaProps &
  React.ComponentProps<typeof CheckboxPrimitive.Root>;

export type SelectOption = {
  value: string;
  label: string | React.ReactNode;
  disabled?: boolean;
};
type SelectProps<
  T extends FieldValues,
  N extends FieldPath<T>,
> = BaseInputProps<T, N> & {
  type: typeof INPUT_TYPES.SELECT;
  options: SelectOption[];
  inputProps?: SelectTriggerProps;
};

type SliderProps<
  T extends FieldValues,
  N extends FieldPath<T>,
> = BaseInputProps<T, N> & {
  type: typeof INPUT_TYPES.SLIDER;
  inputProps?: React.ComponentProps<typeof SliderPrimitive.Root>;
};

type ComboBoxProps<
  T extends FieldValues,
  N extends FieldPath<T>,
> = BaseInputProps<T, N> & {
  type: typeof INPUT_TYPES.COMBOBOX;
  options: Option[];
  inputProps?: React.ComponentProps<typeof ComboBox>;
  multi?: boolean;
  maxVisibleItems?: number;
  flexWrap?: boolean;
};

type NonSelectProps<
  T extends FieldValues,
  N extends FieldPath<T>,
> = BaseInputProps<T, N> & {
  type:
    | typeof INPUT_TYPES.TEXT
    | typeof INPUT_TYPES.URL
    | typeof INPUT_TYPES.NUMBER
    | typeof INPUT_TYPES.TEXTAREA
    | typeof INPUT_TYPES.RICH_TEXT
    | typeof INPUT_TYPES.CHECKBOX
    | typeof INPUT_TYPES.PASSWORD
    | typeof INPUT_TYPES.FILE
    | typeof INPUT_TYPES.EMAIL;
  inputProps?: StandardInputProps;
};

type DatePickerBaseProps<
  T extends FieldValues,
  N extends FieldPath<T>,
> = BaseInputProps<T, N> & {
  type: typeof INPUT_TYPES.DATEPICKER;
  inputProps?: DatePickerProps;
  mode: Mode;
};

export type CustomRenders<T extends FieldValues, N extends FieldPath<T>> = {
  field: ControllerRenderProps<T, N>;
  fieldState: ControllerFieldState;
  formState: UseFormStateReturn<T>;
};

// Custom element props
export type CustomProps<
  T extends FieldValues,
  N extends FieldPath<T>,
> = BaseInputProps<T, N> & {
  type: "custom";
  render: (args: CustomRenders<T, N>) => React.ReactNode;
  inputProps?: never;
};

export type FormInputProps<T extends FieldValues, N extends FieldPath<T>> =
  | SelectProps<T, N>
  | NonSelectProps<T, N>
  | CustomProps<T, N>
  | SliderProps<T, N>
  | DatePickerBaseProps<T, N>
  | ComboBoxProps<T, N>;

export type FormFieldConfig<T extends FieldValues> =
  | Omit<SelectProps<T, FieldPath<T>>, "control">
  | Omit<NonSelectProps<T, FieldPath<T>>, "control">
  | Omit<CustomProps<T, FieldPath<T>>, "control">
  | Omit<DatePickerBaseProps<T, FieldPath<T>>, "control">
  | Omit<SliderProps<T, FieldPath<T>>, "control">
  | Omit<ComboBoxProps<T, FieldPath<T>>, "control">;

function FormInput<T extends FieldValues, N extends FieldPath<T>>(
  props: FormInputProps<T, N>,
) {
  const inputId = React.useId();
  const {
    control,
    name,
    type = INPUT_TYPES.TEXT,
    label = "",
    description = "",
    rules,
    className,
    required,
    note,
    ...rest
  } = props ?? {};

  const { inputProps: _, ...formItem } = rest;

  const formItemPropsClass = cn(
    "h-fit block space-y-2",
    type === INPUT_TYPES.SELECT && "[&>[data-slot=select-trigger]]:mb-0",
    type === INPUT_TYPES.CHECKBOX &&
      "flex items-center flex-row-reverse justify-end space-y-0",
    className,
  );

  return (
    <FormField
      control={control}
      name={name}
      rules={rules}
      render={({ field, formState, fieldState }) => (
        <FormItem className={formItemPropsClass} {...formItem}>
          {label && (
            <FormLabel htmlFor={inputId}>
              {label}
              {required && <span className="text-destructive"> *</span>}
              {note && (
                <Tooltip title={note}>
                  <InformationCircleIcon className="fill-muted size-4" />
                </Tooltip>
              )}
            </FormLabel>
          )}
          <InputRenderer
            {...props}
            field={field}
            fieldState={fieldState}
            formState={formState}
            inputId={inputId}
          />
          {description && <FormDescription>{description}</FormDescription>}
          {type !== INPUT_TYPES.CHECKBOX && <FormMessage />}
        </FormItem>
      )}
    />
  );
}

type InputRendererProps<T extends FieldValues, N extends FieldPath<T>> = {
  field: ControllerRenderProps<T, N>;
  fieldState: ControllerFieldState;
  formState: UseFormStateReturn<T>;
  inputId: string;
} & FormInputProps<T, N>;

export function InputRenderer<T extends FieldValues, N extends FieldPath<T>>({
  type,
  field,
  fieldState,
  formState,
  inputId,
  inputProps,
  placeholder,
  disabled,
  readOnly,
  formControlProps,
  transform,
  // options,
  // render,
  // mode,
  name,
  ...props
}: InputRendererProps<T, N>) {
  const { setValue, trigger, clearErrors, control } = useFormContext();

  const rawValue = (inputProps?.value ?? field.value) as PathValue<T, N>;
  const value = transform ? transform.input(rawValue) : rawValue;

  // Local state to track selected file name for immediate UI update
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  // Watch for file selection - check if name already ends with _files or use name directly
  const filesFieldName = (
    String(name).endsWith("_files") ? name : `${String(name)}_files`
  ) as FieldPath<T>;
  const selectedFiles = useWatch({
    control,
    name: filesFieldName,
    defaultValue: undefined,
  }) as FileList | File[] | null | undefined;

  // Update selectedFileName when selectedFiles changes
  useEffect(() => {
    if (selectedFiles) {
      if (selectedFiles instanceof FileList && selectedFiles.length > 0) {
        setSelectedFileName(selectedFiles[0].name);
      } else if (Array.isArray(selectedFiles) && selectedFiles.length > 0) {
        setSelectedFileName(selectedFiles[0].name);
      } else if (selectedFiles instanceof File) {
        setSelectedFileName(selectedFiles.name);
      }
    } else {
      // Reset if no files selected
      setSelectedFileName(null);
    }
  }, [selectedFiles]);

  switch (type) {
    case INPUT_TYPES.TEXTAREA:
      return (
        <FormControl {...formControlProps}>
          <Textarea
            id={inputId}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            {...field}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => {
              field.onChange(transform ? transform.output(e) : e.target.value);
            }}
            {...inputProps}
          />
        </FormControl>
      );

    case INPUT_TYPES.RICH_TEXT:
      return (
        <FormControl {...formControlProps}>
          <RichTextEditor
            value={typeof value === "string" ? value : ""}
            onChange={(htmlValue) => {
              field.onChange(
                transform ? transform.output(htmlValue) : htmlValue,
              );
            }}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            className={inputProps?.className}
          />
        </FormControl>
      );

    case INPUT_TYPES.CHECKBOX:
      return (
        <FormControl {...formControlProps}>
          <Checkbox
            checked={!!value}
            onCheckedChange={(checked) =>
              field.onChange(transform ? transform.output(checked) : checked)
            }
            className="order-1"
            id={inputId}
            disabled={disabled}
            readOnly={readOnly}
            {...field}
            {...inputProps}
          />
        </FormControl>
      );
    case INPUT_TYPES.SLIDER:
      return (
        <FormControl {...formControlProps}>
          <Slider
            id={inputId}
            {...field}
            disabled={disabled}
            step={50}
            max={300}
            value={[value]}
            onValueChange={(e) => {
              field.onChange(transform ? transform.output(e[0]) : Number(e[0]));
              trigger(name);
            }}
            onChange={() => {}}
            {...inputProps}
          />
        </FormControl>
      );

    case INPUT_TYPES.SELECT: {
      return (
        <FormControl {...formControlProps}>
          {/* <select
            value={value}
            {...field}
            onChange={(e) => {
              field.onChange(
                transform ? transform.output(e.target.value) : e.target.value,
              );
            }}
          ></select> */}
          <SelectRoot
            {...field}
            value={value}
            disabled={disabled}
            onValueChange={(val) => {
              if (val) {
                clearErrors(name);
                field.onChange(transform ? transform.output(val) : val);
                trigger(name);
              }
            }}
          >
            <SelectTrigger {...inputProps}>
              <SelectValue placeholder={placeholder}></SelectValue>
            </SelectTrigger>
            <SelectContent>
              {"options" in props &&
                Array.isArray(props?.options) &&
                props.options.map((option: SelectOption) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    disabled={option?.disabled}
                  >
                    {option.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </SelectRoot>
        </FormControl>
      );
    }

    case INPUT_TYPES.COMBOBOX: {
      return (
        <FormControl {...formControlProps}>
          <ComboBox
            {...inputProps}
            options={("options" in props ? props.options : []) as Option[]}
            placeholder={placeholder}
            value={value}
            disabled={disabled}
            multi={("multi" in props ? props.multi : false) as boolean}
            maxVisibleItems={
              ("maxVisibleItems" in props ? props.maxVisibleItems : 3) as number
            }
            flexWrap={("flexWrap" in props ? props.flexWrap : false) as boolean}
            onChange={(val) => {
              clearErrors(name);
              field.onChange(transform ? transform.output(val) : val);
              trigger(name);
            }}
          />
        </FormControl>
      );
    }

    case INPUT_TYPES.DATEPICKER: {
      return (
        <DatePicker
          {...inputProps}
          {...field}
          mode={"mode" in props ? props.mode : "single"}
          value={value ? value : undefined}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(date) => {
            field.onChange(transform ? transform.output(date) : date);
            trigger(name);
          }}
          aria-invalid={!!formState.errors[name]}
        />
      );
    }
    case INPUT_TYPES.FILE:
      // Get filename from selected files or value
      const getFileName = () => {
        // First check local state (most recent selection)
        if (selectedFileName) {
          return selectedFileName;
        }
        // Check if files are selected from form state (only if they actually exist and are valid)
        if (selectedFiles) {
          // Skip empty arrays - they should not prevent displaying existing URLs
          if (Array.isArray(selectedFiles) && selectedFiles.length === 0) {
            // Empty array, skip to check value
          } else if (
            selectedFiles instanceof FileList &&
            selectedFiles.length > 0
          ) {
            return selectedFiles[0].name;
          } else if (
            Array.isArray(selectedFiles) &&
            selectedFiles.length > 0 &&
            selectedFiles[0] instanceof File
          ) {
            return selectedFiles[0].name;
          } else if (selectedFiles instanceof File) {
            return selectedFiles.name;
          }
        }
        // Fallback to value (for existing URLs or paths) - prioritize URL display
        if (typeof value === "string" && value) {
          // If it's a URL, extract filename for display
          if (isURL(value)) {
            return value.split("/").pop() || value;
          }
          // For file paths
          return value.split("\\").pop()?.split("/").pop() || value;
        }
        if (Array.isArray(value) && value.length > 0 && value[0]?.name) {
          return value[0].name;
        }
        return null;
      };

      const fileName = getFileName();
      // const displayText = fileName || placeholder || "Choose File";

      return (
        <FormControl {...formControlProps}>
          <div>
            <label
              className="form-control items-center gap-1"
              title={fileName || placeholder}
              htmlFor={inputId}
              data-disabled={disabled}
              data-readonly={readOnly}
            >
              <ArrowUpTrayIcon className="block w-4 min-w-4" />
              <input
                {...field}
                type="file"
                hidden
                id={inputId}
                value={undefined}
                onChange={(e) => {
                  const files = e.target?.files;

                  // Update local state immediately for UI responsiveness
                  if (files && files.length > 0) {
                    setSelectedFileName(files[0].name);
                  } else {
                    setSelectedFileName(null);
                  }

                  field.onChange(transform ? transform.output(e) : e);
                  if (type === INPUT_TYPES.FILE && files) {
                    // Convert FileList to Array for proper reactivity in react-hook-form
                    const filesArray = files ? Array.from(files) : [];
                    // Use the same logic as filesFieldName to determine the field name
                    const fieldName = String(name).endsWith("_files")
                      ? name
                      : `${String(name)}_files`;
                    setValue(fieldName as FieldPath<T>, filesArray);
                    trigger(name);
                  }
                }}
                readOnly={readOnly}
                disabled={disabled}
                {...(inputProps?.accept && { accept: inputProps.accept })}
              />
              <p className="text-nowrap">{placeholder}</p>
            </label>

            {fileName && isURL(value) ? (
              <Link
                className="text-foreground block truncate"
                target="_blank"
                to={value}
              >
                {fileName}
              </Link>
            ) : fileName ? (
              <p className="text-foreground truncate">{fileName}</p>
            ) : null}
          </div>
        </FormControl>
      );

    case INPUT_TYPES.CUSTOM:
      return "render" in props
        ? props.render({ field, fieldState, formState })
        : null;

    case INPUT_TYPES.NUMBER:
      return (
        <FormControl {...formControlProps}>
          <Input
            id={inputId}
            placeholder={placeholder}
            type="number"
            disabled={disabled}
            readOnly={readOnly}
            {...field}
            value={value ?? ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              field.onChange(
                transform ? transform.output(e) : e.target?.valueAsNumber,
              );
              trigger(name);
            }}
            {...inputProps}
          />
        </FormControl>
      );

    default:
      return (
        <FormControl {...formControlProps}>
          <Input
            id={inputId}
            placeholder={placeholder}
            type={type}
            disabled={disabled}
            readOnly={readOnly}
            {...field}
            value={
              typeof value === "string" || typeof value === "number"
                ? value
                : ""
            }
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              field.onChange(transform ? transform.output(e) : e.target?.value);
              trigger(name);
            }}
            {...inputProps}
          />
        </FormControl>
      );
  }
}

interface FormFieldsRendererProps<T extends FieldValues>
  extends React.ComponentProps<"div"> {
  control: Control<T>;
  fieldConfigs: FormFieldConfig<T>[];
  children?: React.ReactNode;
}
function FormFieldsRenderer<T extends FieldValues>({
  control,
  fieldConfigs,
  className,
  children,
  ...props
}: FormFieldsRendererProps<T>) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
      {...props}
    >
      {fieldConfigs.map((field) => (
        <FormInput key={field.name} {...field} control={control} />
      ))}
      {children}
    </div>
  );
}

export { FormInput, INPUT_TYPES, FormFieldsRenderer };
