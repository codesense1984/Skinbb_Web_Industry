import { MODE } from "@/core/types";
import CompanyForm from "../components/form/CompanyForm";

const CompanyView = () => {
  return <CompanyForm mode={MODE.VIEW} showApprovalButton={true} />;
};

export default CompanyView;
