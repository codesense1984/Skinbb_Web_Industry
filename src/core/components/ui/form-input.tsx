import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";
import {
  useFormContext,
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

import { cn } from "@/core/utils/index";
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
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { Tooltip } from "./tooltip";
import type { Option } from "@/core/types";

const INPUT_TYPES = {
  TEXT: "text",
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

export type SelectOption = { value: string; label: string | React.ReactNode };
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
    "h-fit",
    type === "checkbox" && "flex items-center flex-row-reverse justify-end",
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
  const { setValue, trigger, clearErrors } = useFormContext();

  const rawValue = (inputProps?.value ?? field.value) as PathValue<T, N>;
  const value = transform ? transform.input(rawValue) : rawValue;

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
              field.onChange(transform ? transform.output(htmlValue) : htmlValue);
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
          <div>
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
          </div>
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
              field.onChange(transform ? transform.output(e[0]) : String(e[0]));
            }}
            {...inputProps}
          />
        </FormControl>
      );

    case INPUT_TYPES.SELECT: {
      return (
        <FormControl {...formControlProps}>
          <SelectRoot
            {...field}
            value={value}
            disabled={disabled}
            onValueChange={(val) => {
              clearErrors(name);
              field.onChange(transform ? transform.output(val) : val);
            }}
          >
            <FormControl>
              <SelectTrigger {...inputProps}>
                <SelectValue placeholder={placeholder}></SelectValue>
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {"options" in props &&
                props?.options?.map((option: SelectOption) => (
                  <SelectItem key={option.value} value={option.value}>
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
            return field.onChange(transform ? transform.output(date) : date);
          }}
          aria-invalid={!!formState.errors[name]}
        />
      );
    }
         case INPUT_TYPES.FILE:
       return (
         <FormControl {...formControlProps}>
           <div className="space-y-2">
             <div className="flex items-center gap-3">
               <input
                 {...field}
                 type="file"
                 className="hidden"
                 id={inputId}
                 value={undefined}
                 onChange={(e) => {
                   field.onChange(transform ? transform.output(e) : e);
                   if (type === INPUT_TYPES.FILE) {
                     // Only set _files suffix if the field name doesn't already end with _files
                     const filesFieldName = String(name).endsWith('_files') 
                       ? String(name) 
                       : `${String(name)}_files`;
                     setValue(filesFieldName, e.target?.files);
                     trigger(name);
                   }
                 }}
                 readOnly={readOnly}
                 disabled={disabled}
                 {...(inputProps?.accept && { accept: inputProps.accept })}
               />
               <label
                 htmlFor={inputId}
                 className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
               >
                 <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                 </svg>
                 <span className="text-sm text-gray-700">Choose File</span>
               </label>
               <span className="text-sm text-gray-500">
                 {placeholder || "PNG, JPG, PDF (MAX. 10MB)"}
               </span>
             </div>
                         {(() => {
               // More strict checking for actual file selection
               let hasValidFile = false;
               let fileName = "";
               
               if (value) {
                 if (typeof value === "string") {
                   // String value - check if it's not empty and has actual content
                   const trimmedValue = value.trim();
                   if (trimmedValue !== "" && trimmedValue !== "undefined" && trimmedValue !== "null") {
                     hasValidFile = true;
                     fileName = trimmedValue.split("\\").pop() || trimmedValue.split("/").pop() || trimmedValue;
                   }
                 } else if (typeof value === "object") {
                   // Object value - could be event or file list
                   if (value.target && value.target.files && value.target.files.length > 0) {
                     hasValidFile = true;
                     fileName = value.target.files[0].name;
                   } else if (value.files && value.files.length > 0) {
                     hasValidFile = true;
                     fileName = value.files[0].name;
                   }
                 }
               }
               
               return hasValidFile ? (
                 <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
                   <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                     <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                   </svg>
                   <span className="text-sm text-green-700 font-medium">
                     {fileName || "File selected"}
                   </span>
                 </div>
               ) : null;
             })()}
          </div>
        </FormControl>
      );

    case INPUT_TYPES.CUSTOM:
      return "render" in props
        ? props.render({ field, fieldState, formState })
        : null;

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
