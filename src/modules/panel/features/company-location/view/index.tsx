import { useParams } from "react-router";
import { CompanyLocationViewCore } from "../components/CompanyLocationViewCore";

const CompanyLocationView = () => {
  const { companyId, locationId } = useParams();

  if (!companyId || !locationId) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-gray-600">Company ID or Location ID not found</p>
        </div>
      </div>
    );
  }

  return (
    <CompanyLocationViewCore
      companyId={companyId}
      locationId={locationId}
      showApprovalActions={true}
    />
  );
};

export default CompanyLocationView;
