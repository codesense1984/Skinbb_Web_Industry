import { PageContent } from "@/core/components/ui/structure.tsx";
import OnBoardForm from "../components/onboard-form/index.tsx";
import { MODE } from "@/core/types/index.ts";

const CompantEdit = () => {
  return (
    <PageContent header={{ title: "Company Edit" }}>
      <OnBoardForm mode={MODE.VIEW} />
    </PageContent>
  );
};

export default CompantEdit;
