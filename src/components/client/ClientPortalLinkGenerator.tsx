
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ClientPortalLinkGenerator = () => {
  const [clientEmail, setClientEmail] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const { toast } = useToast();

  const generateLink = () => {
    if (!clientEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter a client email address",
        variant: "destructive",
      });
      return;
    }

    const baseUrl = window.location.origin;
    const link = `${baseUrl}/client-portal?email=${encodeURIComponent(clientEmail)}`;
    setGeneratedLink(link);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    toast({
      title: "Copied!",
      description: "Client portal link copied to clipboard",
    });
  };

  const openLink = () => {
    window.open(generatedLink, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Client Portal Link</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="clientEmail">Client Email Address</Label>
          <Input
            id="clientEmail"
            type="email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            placeholder="client@example.com"
          />
        </div>
        
        <Button onClick={generateLink} className="w-full">
          Generate Portal Link
        </Button>

        {generatedLink && (
          <div className="space-y-2">
            <Label>Generated Link</Label>
            <div className="flex gap-2">
              <Input
                value={generatedLink}
                readOnly
                className="flex-1"
              />
              <Button variant="outline" size="icon" onClick={copyToClipboard}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={openLink}>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
