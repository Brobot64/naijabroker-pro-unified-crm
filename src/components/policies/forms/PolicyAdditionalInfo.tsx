
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PolicyAdditionalInfoProps {
  formData: {
    underwriter: string;
    start_date: string;
    end_date: string;
    terms_conditions: string;
    notes: string;
  };
  setFormData: (data: any) => void;
}

export const PolicyAdditionalInfo = ({ formData, setFormData }: PolicyAdditionalInfoProps) => {
  return (
    <>
      <div className="grid grid-cols-3 gap-4">
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
          <Label htmlFor="start_date">Start Date</Label>
          <Input
            id="start_date"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({...formData, start_date: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="end_date">End Date</Label>
          <Input
            id="end_date"
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({...formData, end_date: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="terms_conditions">Terms & Conditions</Label>
          <Textarea
            id="terms_conditions"
            value={formData.terms_conditions}
            onChange={(e) => setFormData({...formData, terms_conditions: e.target.value})}
            rows={4}
            placeholder="Policy terms and conditions"
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
