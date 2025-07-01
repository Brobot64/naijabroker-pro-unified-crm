
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ClientPortalLinkGenerator } from "@/components/client/ClientPortalLinkGenerator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface QuickActionsProps {
  userRole: string;
}

export const QuickActions = ({ userRole }: QuickActionsProps) => {
  const getActionsForRole = (role: string) => {
    const commonActions = [
      { label: "Generate Quote", variant: "default" as const },
      { label: "View Dashboard", variant: "outline" as const },
    ];

    switch (role) {
      case "SuperAdmin":
      case "BrokerAdmin":
        return [
          ...commonActions,
          { label: "Add New User", variant: "outline" as const },
          { label: "View Reports", variant: "outline" as const },
          { label: "Client Portal Link", variant: "outline" as const, action: "client-portal" },
        ];
      case "Agent":
        return [
          ...commonActions,
          { label: "Add Lead", variant: "outline" as const },
          { label: "Follow Up", variant: "outline" as const },
          { label: "Client Portal Link", variant: "outline" as const, action: "client-portal" },
        ];
      case "Underwriter":
        return [
          ...commonActions,
          { label: "Review Submission", variant: "outline" as const },
          { label: "Issue Policy", variant: "outline" as const },
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
