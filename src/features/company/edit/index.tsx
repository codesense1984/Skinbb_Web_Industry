import { PageContent } from "@/components/ui/structure";
import OnBoardForm from "../components/onboard-form/index.tsx";
import { MODE } from "@/types";

const CompantEdit = () => {
  return (
    <PageContent header={{ title: "Company Edit" }}>
      <OnBoardForm mode={MODE.VIEW} />
    </PageContent>
  );
};

export default CompantEdit;
