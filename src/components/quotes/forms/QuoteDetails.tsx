
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface QuoteDetailsProps {
  formData: {
    sum_insured: string;
    premium: string;
    commission_rate: string;
    underwriter: string;
    valid_until: string;
    terms_conditions: string;
    notes: string;
  };
  setFormData: (data: any) => void;
}

export const QuoteDetails = ({ formData, setFormData }: QuoteDetailsProps) => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Quote Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sum_insured">Sum Insured (₦)</Label>
              <Input
                id="sum_insured"
                type="number"
                value={formData.sum_insured}
                onChange={(e) => setFormData({...formData, sum_insured: e.target.value})}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="premium">Premium (₦)</Label>
              <Input
                id="premium"
                type="number"
                value={formData.premium}
                onChange={(e) => setFormData({...formData, premium: e.target.value})}
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="commission_rate">Commission Rate (%)</Label>
              <Input
                id="commission_rate"
                type="number"
                value={formData.commission_rate}
                onChange={(e) => setFormData({...formData, commission_rate: e.target.value})}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="underwriter">Underwriter *</Label>
              <Input
                id="underwriter"
                value={formData.underwriter}
                onChange={(e) => setFormData({...formData, underwriter: e.target.value})}
                placeholder="Insurance company name"
              />
            </div>
            <div>
              <Label htmlFor="valid_until">Valid Until</Label>
              <Input
                id="valid_until"
                type="date"
                value={formData.valid_until}
                onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="terms_conditions">Terms & Conditions</Label>
          <Textarea
            id="terms_conditions"
            value={formData.terms_conditions}
            onChange={(e) => setFormData({...formData, terms_conditions: e.target.value})}
            rows={4}
            placeholder="Quote terms and conditions"
          />
        </div>
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            rows={4}
            placeholder="Additional notes"
          />
        </div>
      </div>
    </>
  );
};
