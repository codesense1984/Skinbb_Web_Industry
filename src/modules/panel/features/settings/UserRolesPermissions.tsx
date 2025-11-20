import { PageContent } from "@/core/components/ui/structure";
import { Button } from "@/core/components/ui/button";
import { ExternalLink } from "lucide-react";

const UserRolesPermissions = () => {
  const handleRedirect = () => {
    window.open("https://panel.skintruth.in/role-list?page=1", "_blank");
  };

  return (
    <PageContent
      header={{
        title: "User Roles & Permissions",
        hasBack: false,
        animate: true,
      }}
    >
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
        <div className="max-w-md text-center">
          <h3 className="mb-2 text-lg font-medium">User Roles & Permissions</h3>
          <p className="text-muted-foreground mb-6 text-sm">
            To manage user roles and permissions, please visit the admin panel.
          </p>
          <Button onClick={handleRedirect} size="lg">
            <ExternalLink className="mr-2 h-4 w-4" />
            Go to Admin Panel
          </Button>
        </div>
      </div>
    </PageContent>
  );
};

export default UserRolesPermissions;
