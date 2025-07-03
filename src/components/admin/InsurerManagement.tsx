import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Building2, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Insurer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  specialties: string[];
  rating: number;
  performance_score: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface InsurerFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  specialties: string[];
  rating: number;
  performance_score: number;
  is_active: boolean;
}

export const InsurerManagement = () => {
  const { toast } = useToast();
  const [insurers, setInsurers] = useState<Insurer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingInsurer, setEditingInsurer] = useState<Insurer | null>(null);
  const [formData, setFormData] = useState<InsurerFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    specialties: [],
    rating: 0,
    performance_score: 0,
    is_active: true,
  });

  const specialtyOptions = [
    'Motor', 'Fire', 'Marine', 'Aviation', 'Engineering', 'Oil & Gas', 
    'Life', 'General', 'Health', 'Property', 'Bonds', 'Professional Indemnity'
  ];

  useEffect(() => {
    fetchInsurers();
  }, []);

  const fetchInsurers = async () => {
    try {
      const { data, error } = await supabase
        .from('insurers')
        .select('*')
        .order('name');

      if (error) throw error;
      setInsurers(data || []);
    } catch (error) {
      console.error('Error fetching insurers:', error);
      toast({
        title: "Error",
        description: "Failed to load insurers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      specialties: [],
      rating: 0,
      performance_score: 0,
      is_active: true,
    });
    setEditingInsurer(null);
  };

  const handleEdit = (insurer: Insurer) => {
    setFormData({
      name: insurer.name,
      email: insurer.email || '',
      phone: insurer.phone || '',
      address: insurer.address || '',
      specialties: insurer.specialties || [],
      rating: insurer.rating || 0,
      performance_score: insurer.performance_score || 0,
      is_active: insurer.is_active,
    });
    setEditingInsurer(insurer);
    setShowCreateDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingInsurer) {
        // Update existing insurer
        const { error } = await supabase
          .from('insurers')
          .update({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            specialties: formData.specialties,
            rating: formData.rating,
            performance_score: formData.performance_score,
            is_active: formData.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingInsurer.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Insurer updated successfully",
        });
      } else {
        // Get user's organization
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single();

        if (!profile?.organization_id) throw new Error('Organization not found');

        // Create new insurer
        const { error } = await supabase
          .from('insurers')
          .insert([{
            organization_id: profile.organization_id,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            specialties: formData.specialties,
            rating: formData.rating,
            performance_score: formData.performance_score,
            is_active: formData.is_active,
          }]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Insurer created successfully",
        });
      }

      resetForm();
      setShowCreateDialog(false);
      fetchInsurers();
    } catch (error: any) {
      console.error('Error saving insurer:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save insurer",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const toggleStatus = async (insurer: Insurer) => {
    try {
      const { error } = await supabase
        .from('insurers')
        .update({ is_active: !insurer.is_active })
        .eq('id', insurer.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Insurer ${!insurer.is_active ? 'activated' : 'deactivated'} successfully`,
      });

      fetchInsurers();
    } catch (error) {
      console.error('Error updating insurer status:', error);
      toast({
        title: "Error",
        description: "Failed to update insurer status",
        variant: "destructive"
      });
    }
  };

  if (loading && insurers.length === 0) {
    return <div>Loading insurers...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            <CardTitle>Insurer Management</CardTitle>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={(open) => {
            setShowCreateDialog(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Insurer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingInsurer ? 'Edit Insurer' : 'Add New Insurer'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Company Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rating">Rating (0-5)</Label>
                    <Input
                      id="rating"
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={formData.rating}
                      onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Specialties</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {specialtyOptions.map(specialty => (
                      <label key={specialty} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.specialties.includes(specialty)}
                          onChange={() => toggleSpecialty(specialty)}
                          className="rounded"
                        />
                        <span className="text-sm">{specialty}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="performance">Performance Score (0-100)</Label>
                    <Input
                      id="performance"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.performance_score}
                      onChange={(e) => setFormData(prev => ({ ...prev, performance_score: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : editingInsurer ? 'Update Insurer' : 'Create Insurer'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Specialties</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Performance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {insurers.map((insurer) => (
              <TableRow key={insurer.id}>
                <TableCell className="font-medium">{insurer.name}</TableCell>
                <TableCell>{insurer.email}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {insurer.specialties?.slice(0, 2).map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                    {insurer.specialties?.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{insurer.specialties.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {insurer.rating || 0}
                  </div>
                </TableCell>
                <TableCell>{insurer.performance_score || 0}%</TableCell>
                <TableCell>
                  <Badge className={insurer.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {insurer.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(insurer)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => toggleStatus(insurer)}
                    >
                      {insurer.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {insurers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No insurers found. Add your first insurer to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
};