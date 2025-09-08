import {
  AvatarRoot,
  AvatarFallback,
  AvatarImage,
} from "@/core/components/ui/avatar";
import { Button } from "@/core/components/ui/button";
import { Form } from "@/core/components/ui/form";
import {
  FormInput,
  type FormFieldConfig,
} from "@/core/components/ui/form-input";
import { Container, PageContent } from "@/core/components/ui/structure";
import { cn } from "@/core/utils";
import {
  useEffect,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { useForm, type Control, type FieldValues } from "react-hook-form";
import { useParams } from "react-router";
import {
  brandFormSchema,
  defaultValues,
  type BrandFormData,
} from "./formSchema";

const BrandForm = () => {
  const { id } = useParams();
  const form = useForm<BrandFormData>({
    defaultValues: defaultValues,
  });
  const { control, watch, reset, handleSubmit } = form;
  const [logo, setLogo] = useState("");

  const logoForm = watch("logo_files");

  useEffect(() => {
    const logoObj = logoForm?.[0];
    if (logoObj) {
      const url = URL.createObjectURL(logoObj);
      setLogo(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [logoForm]);

  const onSubmit = (data: unknown) => {
    console.log(data);
  };

  const action = (
    <div className="flex justify-end gap-4">
      <Button variant={"outlined"} type="reset" onClick={() => reset()}>
        Reset
      </Button>
      <Button color={"primary"} type="submit">
        Save
      </Button>
    </div>
  );

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <PageContent
          header={{
            title: id ? "Edit Brand" : "Add Brand",
            actions: action,
          }}
        >
          <Container className="space-y-5">
            <div className="flex items-center gap-2 md:gap-4">
              <AvatarRoot className="size-28 rounded-md border">
                <AvatarImage src={logo} alt="Logo" />
                <AvatarFallback className="rounded-md"></AvatarFallback>
              </AvatarRoot>
              <FormConditionRender
                className="flex"
                control={control}
                formSchema={brandFormSchema.uploadImage}
              />
            </div>
            <Card name={"Brand Information"}>
              <FormConditionRender
                control={control}
                formSchema={brandFormSchema.brand_information}
              />
            </Card>
            <Card name={"Personal Information"}>
              <FormConditionRender
                control={control}
                formSchema={brandFormSchema.personal_information}
              />
            </Card>
            <Card name={"Password"}>
              <FormConditionRender
                control={control}
                formSchema={brandFormSchema.password}
                className="lg:grid-cols-2"
              />
            </Card>
            <Card name={"Legal Documents"}>
              <FormConditionRender
                control={control}
                formSchema={brandFormSchema.legal_documents}
              />
            </Card>

            <Card name={"Address"}>
              <FormConditionRender
                control={control}
                formSchema={brandFormSchema.address}
              />
            </Card>

            {action}
          </Container>
        </PageContent>
      </form>
    </Form>
  );
};

interface FormConditionRenderProps<T extends FieldValues>
  extends ComponentProps<"div"> {
  formSchema: FormFieldConfig<T>[];
  control: Control<T>;
}

function FormConditionRender<T extends FieldValues>({
  formSchema,
  control,
  className,
  ...props
}: FormConditionRenderProps<T>) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
      {...props}
    >
      {formSchema.map((item: FormFieldConfig<T>) => {
        return <FormInput key={item.name} {...item} control={control} />;
      })}
    </div>
  );
}

function Card({ children, name }: { children: ReactNode; name: string }) {
  return (
    <section>
      <h2 className="text-lg font-medium">{name}</h2>
      <hr className="mt-2 mb-5" />
      {children}
    </section>
  );
}

export default BrandForm;
