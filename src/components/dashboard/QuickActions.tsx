
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClientPortalLinkGenerator } from "@/components/client/ClientPortalLinkGenerator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface QuickActionsProps {
  userRole: string;
}

interface ActionItem {
  label: string;
  variant: "default" | "outline";
  action?: string;
}

export const QuickActions = ({ userRole }: QuickActionsProps) => {
  const getActionsForRole = (role: string): ActionItem[] => {
    const commonActions: ActionItem[] = [
      { label: "Generate Quote", variant: "default" },
      { label: "View Dashboard", variant: "outline" },
    ];

    switch (role) {
      case "SuperAdmin":
      case "BrokerAdmin":
        return [
          ...commonActions,
          { label: "Add New User", variant: "outline" },
          { label: "View Reports", variant: "outline" },
          { label: "Client Portal Link", variant: "outline", action: "client-portal" },
        ];
      case "Agent":
        return [
          ...commonActions,
          { label: "Add Lead", variant: "outline" },
          { label: "Follow Up", variant: "outline" },
          { label: "Client Portal Link", variant: "outline", action: "client-portal" },
        ];
      case "Underwriter":
        return [
          ...commonActions,
          { label: "Review Submission", variant: "outline" },
          { label: "Issue Policy", variant: "outline" },
        ];
      default:
        return commonActions;
    }
  };

  const actions = getActionsForRole(userRole);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actions.map((action, index) => (
            action.action === "client-portal" ? (
              <Dialog key={index}>
                <DialogTrigger asChild>
                  <Button
                    variant={action.variant}
                    className="w-full justify-start"
                  >
                    {action.label}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Client Portal Access</DialogTitle>
                  </DialogHeader>
                  <ClientPortalLinkGenerator />
                </DialogContent>
              </Dialog>
            ) : (
              <Button
                key={index}
                variant={action.variant}
                className="w-full justify-start"
              >
                {action.label}
              </Button>
            )
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
