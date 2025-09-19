import { useParams } from "react-router";
import { CompanyViewCore } from "../components/CompanyViewCore";

const CompanyView = () => {
  const { id } = useParams();

  if (!id) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-gray-600">Company ID not found</p>
        </div>
      </div>
    );
  }

  return (
    <CompanyViewCore
      companyId={id}
      showViewUsersAction={true}
    />
  );
};

export default CompanyView;