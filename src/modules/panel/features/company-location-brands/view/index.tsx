import { useParams, useNavigate } from 'react-router';
import { PageContent } from '@/core/components/ui/structure';
import { Button } from '@/core/components/ui/button';
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/solid';
import { PANEL_ROUTES } from '@/modules/panel/routes/constant';
import BrandForm from '../shared/brand-form';

const CompanyLocationBrandView = () => {
  const { companyId, locationId, brandId } = useParams();
  const navigate = useNavigate();

  return (
    <PageContent
      header={{
        title: "Brand Details",
        description: "View brand information and details",
        actions: (
          <div className="flex gap-2">
            <Button
              onClick={() => navigate(PANEL_ROUTES.COMPANY_LOCATION.BRANDS(companyId!, locationId!))}
              variant="outlined"
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to Brands
            </Button>
            <Button
              onClick={() => navigate(PANEL_ROUTES.COMPANY_LOCATION.BRAND_EDIT(companyId!, locationId!, brandId!))}
              variant="contained"
            >
              <PencilIcon className="mr-2 h-4 w-4" />
              Edit Brand
            </Button>
          </div>
        ),
      }}
    >
      <BrandForm />
    </PageContent>
  );
};

export default CompanyLocationBrandView;
