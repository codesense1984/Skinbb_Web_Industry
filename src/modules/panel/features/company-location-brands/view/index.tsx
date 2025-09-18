import { MODE } from "@/core/types";
import { useParams } from "react-router";
import { BrandPageWrapper } from "../BrandPageWrapper";

const CompanyLocationBrandView = () => {
  const { brandId } = useParams();

  return (
    <BrandPageWrapper
      mode={MODE.VIEW}
      title="View Brand"
      description="View brand information and details"
      brandId={brandId}
    />
  );
};

export default CompanyLocationBrandView;
