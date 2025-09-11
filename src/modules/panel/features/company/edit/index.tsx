import { MODE } from "@/core/types";
import CompanyForm from "../components/form/CompanyForm";

const CompanyEdit = () => {
  return <CompanyForm mode={MODE.EDIT} />;
};

export default CompanyEdit;
