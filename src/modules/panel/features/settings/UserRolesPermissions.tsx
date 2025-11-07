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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="text-center max-w-md">
          <h3 className="text-lg font-medium mb-2">
            User Roles & Permissions
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
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

