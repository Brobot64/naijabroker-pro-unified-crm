import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Insurer {
  id: string;
  name: string;
  email: string;
}

interface InsurerSelectProps {
  value: string;
  onInsurerChange: (name: string, email: string, id?: string) => void;
  emailValue: string;
  onEmailChange: (email: string) => void;
  disabled?: boolean;
}

export const InsurerSelect = ({ 
  value, 
  onInsurerChange, 
  emailValue, 
  onEmailChange, 
  disabled 
}: InsurerSelectProps) => {
  const [insurers, setInsurers] = useState<Insurer[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCustom, setIsCustom] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchInsurers();
  }, []);

  const fetchInsurers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('insurers')
        .select('id, name, email')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching insurers:', error);
        toast({
          title: "Error",
          description: "Failed to load insurers",
          variant: "destructive"
        });
      } else {
        setInsurers(data || []);
      }
    } catch (error) {
      console.error('Error fetching insurers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInsurerSelect = (insurerId: string) => {
    if (insurerId === 'custom') {
      setIsCustom(true);
      onInsurerChange('', '');
      onEmailChange('');
    } else {
      const selectedInsurer = insurers.find(i => i.id === insurerId);
      if (selectedInsurer) {
        setIsCustom(false);
        onInsurerChange(selectedInsurer.name, selectedInsurer.email, selectedInsurer.id);
        onEmailChange(selectedInsurer.email);
      }
    }
  };

  const handleCustomNameChange = (name: string) => {
    onInsurerChange(name, emailValue);
  };

  if (isCustom) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Custom Insurer</Label>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setIsCustom(false);
              onInsurerChange('', '');
              onEmailChange('');
            }}
          >
            Back to List
          </Button>
        </div>
        <div className="space-y-2">
          <Label>Insurer Name</Label>
          <Input
            value={value}
            onChange={(e) => handleCustomNameChange(e.target.value)}
            placeholder="Enter custom insurer name"
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label>Insurer Email</Label>
          <Input
            value={emailValue}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="Enter insurer email"
            type="email"
            disabled={disabled}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Insurer Name</Label>
        <Select onValueChange={handleInsurerSelect} disabled={disabled || loading}>
          <SelectTrigger>
            <SelectValue placeholder={loading ? "Loading insurers..." : "Select an insurer"} />
          </SelectTrigger>
          <SelectContent>
            {insurers.map((insurer) => (
              <SelectItem key={insurer.id} value={insurer.id}>
                {insurer.name}
              </SelectItem>
            ))}
            <SelectItem value="custom">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Custom Insurer
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {value && (
        <div className="space-y-2">
          <Label>Insurer Email</Label>
          <Input
            value={emailValue}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="Insurer email"
            type="email"
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
};