import { useParams, useNavigate } from 'react-router';
import { PageContent } from '@/core/components/ui/structure';
import { Button } from '@/core/components/ui/button';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { PANEL_ROUTES } from '@/modules/panel/routes/constant';
import BrandForm from '../shared/brand-form';

const CompanyLocationBrandEdit = () => {
  const { companyId, locationId, brandId } = useParams();
  const navigate = useNavigate();

  return (
    <PageContent
      header={{
        title: "Edit Brand",
        description: "Update brand information and details",
        actions: (
          <Button
            onClick={() => navigate(PANEL_ROUTES.COMPANY_LOCATION.BRAND_VIEW(companyId!, locationId!, brandId!))}
            variant="outlined"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to View
          </Button>
        ),
      }}
    >
      <BrandForm />
    </PageContent>
  );
};

export default CompanyLocationBrandEdit;
