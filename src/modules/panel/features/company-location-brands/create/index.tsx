import { useParams, useNavigate } from 'react-router';
import { PageContent } from '@/core/components/ui/structure';
import { Button } from '@/core/components/ui/button';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { PANEL_ROUTES } from '@/modules/panel/routes/constant';
import BrandForm from '../shared/brand-form';

const CompanyLocationBrandCreate = () => {
  const { companyId, locationId } = useParams();
  const navigate = useNavigate();

  return (
    <PageContent
      header={{
        title: "Create Brand",
        description: "Add a new brand for this location",
        actions: (
          <Button
            onClick={() => navigate(PANEL_ROUTES.COMPANY_LOCATION.BRANDS(companyId!, locationId!))}
            variant="outlined"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Brands
          </Button>
        ),
      }}
    >
      <BrandForm />
    </PageContent>
  );
};

export default CompanyLocationBrandCreate;
