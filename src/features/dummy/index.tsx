import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/core/components/ui/toggle-group";
import { ROUTES } from "@/core/routes/routes.constant";
import { Outlet, useLocation, useNavigate } from "react-router";

const URLS = [ROUTES.D_CHARTS, ROUTES.D_TABLE];

const Dummy = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  function routeLabel(url: string) {
    return url.split("/").slice(-1);
  }
  return (
    <div className="w-full p-5">
      <div className="flex w-full justify-center">
        <ToggleGroup
          type="single"
          value={pathname}
          onValueChange={(val) => navigate(val)}
        >
          {URLS.map((url) => (
            <ToggleGroupItem
              className="border p-5 capitalize"
              key={url}
              value={url}
            >
              {routeLabel(url)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <br />
      <h2 className="text-center text-3xl capitalize">
        {routeLabel(pathname)}
      </h2>
      <Outlet />
    </div>
  );
};

export default Dummy;
