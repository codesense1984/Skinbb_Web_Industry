import { createSimpleFetcher } from "@/core/components/data-table";
import { apiGetCoupons } from "@/modules/panel/services/http/coupon.service";

export const fetcher = () =>
  createSimpleFetcher(apiGetCoupons, {
    dataPath: "data.coupons",
    totalPath: "data.totalRecords",
    filterMapping: {
      search: "search",
      sortBy: "sortBy",
      order: "order",
    },
  });
