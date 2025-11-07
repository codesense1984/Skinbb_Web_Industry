import { PageContent } from "@/core/components/ui/structure";
import { useQuery } from "@tanstack/react-query";
import { apiGetSellerProfile } from "../../services/http/profile.service";
import { FullLoader } from "@/core/components/ui/loader";
import { Alert } from "@/core/components/ui/alert";
import {
  AvatarFallback,
  AvatarImage,
  AvatarRoot,
} from "@/core/components/ui/avatar";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { Button } from "@/core/components/ui/button";
import { PencilIcon } from "@heroicons/react/24/outline";

const AccountPage = () => {
  const { user } = useAuth();
  const fullName = user?.firstName || "";
  const profile = user?.profilePic?.[0]?.url || "";
  const fullNameInitial = `${user?.firstName?.charAt(0) || ""}${user?.lastName?.charAt(0) || ""}`;

  const {
    data: profileData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["seller-profile"],
    queryFn: () => apiGetSellerProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <PageContent ariaLabel="account page" header={{ title: "Profile" }}>
        <FullLoader />
      </PageContent>
    );
  }

  if (error) {
    return (
      <PageContent ariaLabel="account page" header={{ title: "Profile" }}>
        <Alert variant="destructive">
          Failed to load profile data. Please try again later.
        </Alert>
      </PageContent>
    );
  }

  const personalInfo = profileData?.data?.personalInformation;

  return (
    <PageContent
      ariaLabel="account page"
      header={{
        title: "Profile",
        hasBack: false,
        animate: true,
      }}
    >
      <div className="space-y-6">
        {/* Header Section with Profile Picture */}
        <div className="bg-background rounded-lg border p-6">
          <div className="flex items-center gap-4">
            <AvatarRoot className="bg-primary/10 size-20 border-2 font-medium tracking-wide uppercase">
              <AvatarImage src={profile} />
              <AvatarFallback className="text-lg">
                {fullNameInitial}
              </AvatarFallback>
            </AvatarRoot>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {personalInfo?.fullName || fullName}
                </h2>
                {/* <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-600 hover:text-gray-900"
                >
                  <PencilIcon className="h-4 w-4" />
                </Button> */}
              </div>
              <p className="text-sm text-gray-600 capitalize">
                {personalInfo?.role || user?.roleValue}
              </p>
            </div>
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="bg-background rounded-lg border">
          <div className="border-b p-4">
            <h3 className="text-lg font-semibold text-gray-900 underline">
              Personal Information
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="text-base font-medium text-gray-900">
                    {personalInfo?.fullName || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone No</p>
                  <p className="text-base font-medium text-gray-900">
                    {personalInfo?.phoneNo || "-"}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="text-base font-medium text-gray-900">
                    {personalInfo?.role || "-"}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-base font-medium text-gray-900">
                    {personalInfo?.email || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Joined Date</p>
                  <p className="text-base font-medium text-gray-900">
                    {personalInfo?.joinedDate || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContent>
  );
};

export default AccountPage;

