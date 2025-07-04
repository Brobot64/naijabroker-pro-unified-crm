import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link, Mail, Copy } from "lucide-react";

interface PaymentLinkGeneratorProps {
  paymentData: any;
  clientData: any;
  onClose?: () => void;
}

export const PaymentLinkGenerator = ({ paymentData, clientData, onClose }: PaymentLinkGeneratorProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string>("");
  const [clientEmail, setClientEmail] = useState(clientData?.email || "");

  const generatePaymentLink = async () => {
    if (!clientEmail) {
      toast({
        title: "Email Required",
        description: "Please enter client email address",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-payment-link', {
        body: {
          paymentTransactionId: paymentData.id,
          clientEmail,
          clientName: clientData?.name || "Client",
          amount: paymentData.amount,
          currency: paymentData.currency || "NGN"
        }
      });

      if (error) throw error;

      setGeneratedLink(data.paymentUrl);
      toast({
        title: "Payment Link Generated",
        description: "Payment link has been generated and sent to client",
      });

    } catch (error: any) {
      console.error('Error generating payment link:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate payment link",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    toast({
      title: "Copied",
      description: "Payment link copied to clipboard",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5" />
          Generate Payment Link
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-gray-600 text-sm">Client:</span>
            <p className="font-semibold">{clientData?.name || "Unknown"}</p>
          </div>
          <div>
            <span className="text-gray-600 text-sm">Amount:</span>
            <p className="font-semibold">₦{paymentData.amount?.toLocaleString() || "0"}</p>
          </div>
        </div>

        <div>
          <Label htmlFor="clientEmail">Client Email Address</Label>
          <Input
            id="clientEmail"
            type="email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            placeholder="client@example.com"
            required
          />
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={generatePaymentLink}
            disabled={loading || !clientEmail}
            className="flex-1"
          >
            {loading ? "Generating..." : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Generate & Send Link
              </>
            )}
          </Button>
          
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>

        {generatedLink && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Generated Payment Link:</span>
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
            </div>
            <p className="text-xs text-gray-600 break-all">{generatedLink}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};