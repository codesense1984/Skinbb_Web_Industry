import type { EntityFormComponentProps } from "@/components/dialogs/EntityDialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/ui/form-input";
import type { ShortCompany } from "@/types/company.type";
import { cn } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  shortCompanyDefaultValues,
  shortCompanyFormFields,
  shortCompanyZodSchema,
} from "../schema/shortCompany.schema";

const AddCompanyForm = ({ className, onClose }: EntityFormComponentProps) => {
  const form = useForm<ShortCompany>({
    defaultValues: shortCompanyDefaultValues,
    resolver: zodResolver(shortCompanyZodSchema),
  });

  const { control, handleSubmit, reset } = form;

  const onSubmit = (data: ShortCompany) => {
    console.log("Company Submitted:", data);
    toast.success("Company add successfully!");
    onClose?.();
  };

  const actions = (
    <div className="flex justify-end gap-4">
      <Button variant="outlined" type="reset" onClick={() => reset()}>
        Reset
      </Button>
      <Button color="primary" type="submit">
        Submit
      </Button>
    </div>
  );

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={cn("space-y-4", className)}
      >
        {shortCompanyFormFields.map((item) => (
          <FormInput key={item.name} {...item} control={control} />
        ))}
        {actions}
      </form>
    </Form>
  );
};

export default AddCompanyForm;
