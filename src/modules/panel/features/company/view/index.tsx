import { useParams, useNavigate } from "react-router";
import { CompanyViewCore } from "../components/CompanyViewCore";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";

const CompanyView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  if (!id) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-gray-600">Company ID not found</p>
        </div>
      </div>
    );
  }

  const handleViewLocation = (_companyId: string, locationId: string) => {
    navigate(PANEL_ROUTES.COMPANY_LOCATION.VIEW(_companyId, locationId));
  };

  const handleEditLocation = (companyId: string, locationId: string) => {
    navigate(PANEL_ROUTES.ONBOARD.COMPANY_EDIT(companyId, locationId));
  };

  return (
    <CompanyViewCore
      companyId={id}
      showViewUsersAction={true}
      onViewLocation={handleViewLocation}
      onEditLocation={handleEditLocation}
    />
  );
};

export default CompanyView;
