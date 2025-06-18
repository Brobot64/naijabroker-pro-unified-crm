
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PolicyFinancialDetailsProps {
  formData: {
    sum_insured: string;
    premium: string;
    commission_rate: string;
    commission_amount: string;
  };
  setFormData: (data: any) => void;
  calculateCommission: () => void;
}

export const PolicyFinancialDetails = ({ formData, setFormData, calculateCommission }: PolicyFinancialDetailsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Details</CardTitle>
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
              onChange={(e) => {
                setFormData({...formData, premium: e.target.value});
                setTimeout(calculateCommission, 100);
              }}
              placeholder="0.00"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="commission_rate">Commission Rate (%)</Label>
            <Input
              id="commission_rate"
              type="number"
              value={formData.commission_rate}
              onChange={(e) => {
                setFormData({...formData, commission_rate: e.target.value});
                setTimeout(calculateCommission, 100);
              }}
              placeholder="0.00"
            />
          </div>
          <div>
            <Label htmlFor="commission_amount">Commission Amount (₦)</Label>
            <Input
              id="commission_amount"
              type="number"
              value={formData.commission_amount}
              onChange={(e) => setFormData({...formData, commission_amount: e.target.value})}
              placeholder="0.00"
              readOnly
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
