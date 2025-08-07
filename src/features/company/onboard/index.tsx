import { MODE } from "@/types";
import OnBoardForm from "../components/onboard-form/index.tsx";

const CompanyOnboard = () => {
  return (
    // <PageContent as={"main"} className="min-h-screen rounded-none">
    // <div className="">
    <OnBoardForm mode={MODE.ADD} />
    // </div>
    // </PageContent>
  );
};

export default CompanyOnboard;
