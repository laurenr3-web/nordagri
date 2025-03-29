import React, { useState, useEffect } from 'react';
import { SettingsSection } from '../SettingsSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Building, MapPin, Phone, Mail, Globe, Euro } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FarmInfo {
  id?: string;
  owner_id: string;
  name?: string;
  company_name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  vat_number?: string;
  registration_number?: string;
  default_currency: string;
  description?: string;
  location?: string;
  size?: number;
  size_unit?: string;
}

export const FarmInfoSection = () => {
  const [farmInfo, setFarmInfo] = useState<FarmInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedFarmInfo, setEditedFarmInfo] = useState<FarmInfo | null>(null);

  useEffect(() => {
    const fetchFarmInfo = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData?.session?.user) {
          setLoading(false);
          return;
        }
        
        // Get farm info
        const { data, error } = await supabase
          .from('farms')
          .select('*')
          .eq('owner_id', sessionData.session.user.id)
          .maybeSingle();
          
        if (error) throw error;
        
        if (data) {
          setFarmInfo(data);
        } else {
          // Initialize empty farm info with user id
          setFarmInfo({
            owner_id: sessionData.session.user.id,
            company_name: '',
            name: '',
            address: '',
            phone: '',
            email: sessionData.session.user.email || '',
            default_currency: 'EUR'
          });
        }
      } catch (error) {
        console.error('Error fetching farm info:', error);
        toast.error('Failed to load farm information');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFarmInfo();
  }, []);

  const handleEditFarmInfo = () => {
    setEditedFarmInfo({...farmInfo!});
    setEditDialogOpen(true);
  };

  const handleSaveFarmInfo = async () => {
    if (!editedFarmInfo) return;
    
    try {
      setLoading(true);
      
      // Keep compatibility with older fields
      const updateData = {
        name: editedFarmInfo.company_name, // For backward compatibility
        company_name: editedFarmInfo.company_name,
        address: editedFarmInfo.address,
        phone: editedFarmInfo.phone,
        email: editedFarmInfo.email,
        website: editedFarmInfo.website,
        vat_number: editedFarmInfo.vat_number,
        registration_number: editedFarmInfo.registration_number,
        default_currency: editedFarmInfo.default_currency,
        location: editedFarmInfo.address, // For backward compatibility
        updated_at: new Date().toISOString()
      };
      
      if (farmInfo?.id) {
        // Update existing farm
        const { error } = await supabase
          .from('farms')
          .update(updateData)
          .eq('id', farmInfo.id);
          
        if (error) throw error;
      } else {
        // Create new farm
        const { data, error } = await supabase
          .from('farms')
          .insert({
            owner_id: editedFarmInfo.owner_id,
            ...updateData
          })
          .select()
          .single();
          
        if (error) throw error;
        
        if (data) {
          setFarmInfo(data);
        }
      }
      
      setFarmInfo(editedFarmInfo);
      setEditDialogOpen(false);
      toast.success('Farm information updated successfully');
    } catch (error) {
      console.error('Error saving farm info:', error);
      toast.error('Failed to update farm information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsSection 
      title="Farm Information" 
      description="Manage your farm or company details"
    >
      <div className="flex items-start gap-4 mb-6">
        <div className="bg-secondary h-16 w-16 rounded-full flex items-center justify-center">
          <Building className="h-8 w-8 text-secondary-foreground" />
        </div>
        <div className="space-y-4 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium">
                {loading ? 'Loading...' : (farmInfo?.company_name || 'No company name set')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {farmInfo?.address && <span className="flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" /> {farmInfo.address}</span>}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleEditFarmInfo}
              disabled={loading}
            >
              Edit Farm Info
            </Button>
          </div>
          
          {farmInfo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {farmInfo.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{farmInfo.phone}</span>
                </div>
              )}
              
              {farmInfo.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{farmInfo.email}</span>
                </div>
              )}
              
              {farmInfo.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span>{farmInfo.website}</span>
                </div>
              )}
              
              {farmInfo.default_currency && (
                <div className="flex items-center gap-2">
                  <Euro className="h-4 w-4 text-muted-foreground" />
                  <span>Currency: {farmInfo.default_currency}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Farm Info Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Farm Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input 
                id="company-name" 
                value={editedFarmInfo?.company_name || ''} 
                onChange={(e) => setEditedFarmInfo(prev => prev ? {...prev, company_name: e.target.value} : null)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input 
                id="address" 
                value={editedFarmInfo?.address || ''} 
                onChange={(e) => setEditedFarmInfo(prev => prev ? {...prev, address: e.target.value} : null)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                value={editedFarmInfo?.phone || ''} 
                onChange={(e) => setEditedFarmInfo(prev => prev ? {...prev, phone: e.target.value} : null)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                value={editedFarmInfo?.email || ''} 
                onChange={(e) => setEditedFarmInfo(prev => prev ? {...prev, email: e.target.value} : null)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website (optional)</Label>
              <Input 
                id="website" 
                value={editedFarmInfo?.website || ''} 
                onChange={(e) => setEditedFarmInfo(prev => prev ? {...prev, website: e.target.value} : null)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vat-number">VAT Number (optional)</Label>
              <Input 
                id="vat-number" 
                value={editedFarmInfo?.vat_number || ''} 
                onChange={(e) => setEditedFarmInfo(prev => prev ? {...prev, vat_number: e.target.value} : null)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registration-number">Registration Number (optional)</Label>
              <Input 
                id="registration-number" 
                value={editedFarmInfo?.registration_number || ''} 
                onChange={(e) => setEditedFarmInfo(prev => prev ? {...prev, registration_number: e.target.value} : null)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Default Currency</Label>
              <Select 
                value={editedFarmInfo?.default_currency || 'EUR'}
                onValueChange={(value) => setEditedFarmInfo(prev => prev ? {...prev, default_currency: value} : null)}
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                  <SelectItem value="USD">US Dollar ($)</SelectItem>
                  <SelectItem value="GBP">British Pound (£)</SelectItem>
                  <SelectItem value="CAD">Canadian Dollar (C$)</SelectItem>
                  <SelectItem value="AUD">Australian Dollar (A$)</SelectItem>
                  <SelectItem value="JPY">Japanese Yen (¥)</SelectItem>
                  <SelectItem value="CHF">Swiss Franc (Fr)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveFarmInfo}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SettingsSection>
  );
};
