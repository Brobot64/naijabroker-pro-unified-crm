
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PolicyClientInfoProps {
  formData: {
    client_name: string;
    client_email: string;
    client_phone: string;
  };
  setFormData: (data: any) => void;
}

export const PolicyClientInfo = ({ formData, setFormData }: PolicyClientInfoProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="client_name">Client Name *</Label>
            <Input
              id="client_name"
              value={formData.client_name}
              onChange={(e) => setFormData({...formData, client_name: e.target.value})}
              placeholder="Client full name"
            />
          </div>
          <div>
            <Label htmlFor="client_email">Email</Label>
            <Input
              id="client_email"
              type="email"
              value={formData.client_email}
              onChange={(e) => setFormData({...formData, client_email: e.target.value})}
              placeholder="client@email.com"
            />
          </div>
          <div>
            <Label htmlFor="client_phone">Phone</Label>
            <Input
              id="client_phone"
              value={formData.client_phone}
              onChange={(e) => setFormData({...formData, client_phone: e.target.value})}
              placeholder="+234XXXXXXXXXX"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
