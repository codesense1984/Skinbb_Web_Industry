import { PageContent } from "@/core/components/ui/structure";
import { Button } from "@/core/components/ui/button";
import { NavLink } from "react-router";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";

const UserList = () => {
  return (
    <PageContent
      header={{
        title: "User Management",
        description: "Manage user accounts, roles, and permissions.",
        actions: (
          <Button color={"primary"} asChild>
            <NavLink to={PANEL_ROUTES.USER.CREATE}>Add User</NavLink>
          </Button>
        ),
      }}
    >
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium">User Management</h3>
          <p className="text-muted-foreground">User list functionality coming soon.</p>
        </div>
      </div>
    </PageContent>
  );
};

export default UserList;