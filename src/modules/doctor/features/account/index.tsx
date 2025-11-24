import { PageContent } from "@/core/components/ui/structure";
import {
  AvatarFallback,
  AvatarImage,
  AvatarRoot,
} from "@/core/components/ui/avatar";
import { useAuth } from "@/modules/auth/hooks/useAuth";

const AccountPage = () => {
  const { user } = useAuth();
  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  const profile = user?.profilePic?.[0]?.url || "";
  const fullNameInitial = `${user?.firstName?.charAt(0) || ""}${user?.lastName?.charAt(0) || ""}`;

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
                  {fullName || "-"}
                </h2>
              </div>
              <p className="text-sm text-gray-600 capitalize">
                {user?.roleLabel || user?.roleValue || "-"}
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
                    {fullName || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone No</p>
                  <p className="text-base font-medium text-gray-900">
                    {user?.phoneNumber || "-"}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="text-base font-medium text-gray-900">
                    {user?.roleLabel || user?.roleValue || "-"}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-base font-medium text-gray-900">
                    {user?.email || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">User ID</p>
                  <p className="text-base font-medium text-gray-900">
                    {user?._id || "-"}
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
