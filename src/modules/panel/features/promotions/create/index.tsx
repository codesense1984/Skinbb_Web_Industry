import { PageContent } from "@/core/components/ui/structure";
import { PromotionForm } from "../shared/promotion-form";

const PromotionCreate = () => {
  return (
    <PageContent
      header={{
        title: "Create Promotion",
        description: "Add a new promotional banner or curated store",
      }}
    >
      <PromotionForm isEdit={false} isView={false} />
    </PageContent>
  );
};

export default PromotionCreate;

