import { PageContent } from "@/components/ui/structure";
import OnBoardForm from "../components/onboard-form/index.tsx";
import { MODE } from "@/types";

const CompanyOnboard = () => {
  return (
    <PageContent as={"main"} className="min-h-screen rounded-none">
      <div className="mx-auto w-full max-w-5xl">
        <OnBoardForm mode={MODE.ADD} />
      </div>
    </PageContent>
  );
};

export default CompanyOnboard;
