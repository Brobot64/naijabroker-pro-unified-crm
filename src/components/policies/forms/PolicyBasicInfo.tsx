
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface PolicyBasicInfoProps {
  formData: {
    policy_number: string;
    policy_type: string;
  };
  setFormData: (data: any) => void;
}

export const PolicyBasicInfo = ({ formData, setFormData }: PolicyBasicInfoProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="policy_number">Policy Number *</Label>
        <Input
          id="policy_number"
          value={formData.policy_number}
          onChange={(e) => setFormData({...formData, policy_number: e.target.value})}
          placeholder="POL-XXXXXX"
        />
      </div>
      <div>
        <Label htmlFor="policy_type">Policy Type *</Label>
        <select
          id="policy_type"
          value={formData.policy_type}
          onChange={(e) => setFormData({...formData, policy_type: e.target.value})}
          className="w-full p-2 border rounded"
        >
          <option value="">Select Type</option>
          <option value="Motor">Motor Insurance</option>
          <option value="Fire">Fire Insurance</option>
          <option value="Marine">Marine Insurance</option>
          <option value="General">General Insurance</option>
          <option value="Life">Life Insurance</option>
        </select>
      </div>
    </div>
  );
};
