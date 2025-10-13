import { MODE } from "@/core/types";
import { useParams } from "react-router";
import { BrandPageWrapper } from "../../../brands/shared/BrandPageWrapper";

const CompanyBrandEdit = () => {
  const { companyId, brandId } = useParams();

  return (
    <BrandPageWrapper
      mode={MODE.EDIT}
      title="Edit Brand"
      description="Update brand information and details"
      companyId={companyId}
      brandId={brandId}
    />
  );
};

export default CompanyBrandEdit;
