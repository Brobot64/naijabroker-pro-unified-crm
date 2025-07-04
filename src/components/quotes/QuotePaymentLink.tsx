import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link, Mail, Copy, ExternalLink } from "lucide-react";

interface QuotePaymentLinkProps {
  quote: any;
  clientData: any;
}

export const QuotePaymentLink = ({ quote, clientData }: QuotePaymentLinkProps) => {
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
      // Get user's organization
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .single();

      if (!profile?.organization_id) {
        throw new Error('Organization not found');
      }

      // Create payment transaction first
      const { data: paymentTransaction, error: transactionError } = await supabase
        .from('payment_transactions')
        .insert({
          organization_id: profile.organization_id,
          quote_id: quote.id,
          client_id: clientData.id,
          amount: quote.premium_quoted || quote.premium,
          currency: 'NGN',
          payment_method: 'gateway',
          status: 'pending'
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Generate payment link using edge function
      const { data, error } = await supabase.functions.invoke('generate-payment-link', {
        body: {
          paymentTransactionId: paymentTransaction.id,
          clientEmail,
          clientName: clientData?.name || "Client",
          amount: quote.premium_quoted || quote.premium,
          currency: 'NGN'
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
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      toast({
        title: "Copied",
        description: "Payment link copied to clipboard",
      });
    }
  };

  const openLink = () => {
    if (generatedLink) {
      window.open(generatedLink, '_blank');
    }
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
            <p className="font-semibold">₦{(quote.premium_quoted || quote.premium || 0).toLocaleString()}</p>
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

        <Button 
          onClick={generatePaymentLink}
          disabled={loading || !clientEmail}
          className="w-full"
        >
          {loading ? "Generating..." : (
            <>
              <Mail className="h-4 w-4 mr-2" />
              Generate & Send Payment Link
            </>
          )}
        </Button>

        {generatedLink && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Generated Payment Link:</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={openLink}>
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Open
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-600 break-all">{generatedLink}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};