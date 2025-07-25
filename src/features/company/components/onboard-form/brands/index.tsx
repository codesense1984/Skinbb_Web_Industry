import { useSearchParams } from "react-router";
import BrandForm from "./BrandForm";
import BrandList from "./BrandList";

const Brands = () => {
  const [searchParam, setSearchParam] = useSearchParams();
  const currentTab = searchParam.get("currentBrandTab") ?? "list";
  const handleChange = () => {
    const params = Object.fromEntries(searchParam.entries());
    setSearchParam({
      ...params,
      currentBrandTab: currentTab === "list" ? "form" : "list",
    });
  };
  return (
    <div>
      {currentTab === "form" ? (
        <BrandForm />
      ) : (
        <BrandList onAdd={handleChange} />
      )}
    </div>
  );
};

export default Brands;
