import { MODE } from "@/core/types";
import { useParams } from "react-router";
import { BrandPageWrapper } from "../../../brands/shared/BrandPageWrapper";

const CompanyBrandView = () => {
  const { companyId, brandId } = useParams();

  return (
    <BrandPageWrapper
      mode={MODE.VIEW}
      title="View Brand"
      description="View brand information and details"
      companyId={companyId}
      brandId={brandId}
    />
  );
};

export default CompanyBrandView;
