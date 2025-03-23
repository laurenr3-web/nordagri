
import React from 'react';
import { SettingsSection } from './SettingsSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Tractor, Wrench, Coins } from 'lucide-react';

export const SettingsEquipment = () => {
  return (
    <div className="space-y-6">
      <SettingsSection 
        title="Default Equipment Types" 
        description="Configure standard equipment categories and types"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-secondary h-16 w-16 rounded-full flex items-center justify-center">
            <Tractor className="h-8 w-8 text-secondary-foreground" />
          </div>
          <div className="space-y-4 flex-1">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Equipment Categories</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium leading-none">Tractors</h4>
                        <p className="text-xs text-muted-foreground">
                          Main power units for farming operations
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium leading-none">Harvesters</h4>
                        <p className="text-xs text-muted-foreground">
                          Specialized crop collection machinery
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium leading-none">Tillage Equipment</h4>
                        <p className="text-xs text-muted-foreground">
                          Soil preparation implements
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium leading-none">Sprayers</h4>
                        <p className="text-xs text-muted-foreground">
                          Chemical application equipment
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium leading-none">Seeders</h4>
                        <p className="text-xs text-muted-foreground">
                          Planting and seeding machinery
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium leading-none">Transport</h4>
                        <p className="text-xs text-muted-foreground">
                          Trailers and material handling
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium leading-none">Livestock Equipment</h4>
                        <p className="text-xs text-muted-foreground">
                          Specialized livestock management machinery
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium leading-none">Other Tools</h4>
                        <p className="text-xs text-muted-foreground">
                          Miscellaneous equipment and implements
                        </p>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Manufacturers</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium leading-none">John Deere</h4>
                        <p className="text-xs text-muted-foreground">
                          Full range of agricultural equipment
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium leading-none">Case IH</h4>
                        <p className="text-xs text-muted-foreground">
                          Tractors and harvesting equipment
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium leading-none">New Holland</h4>
                        <p className="text-xs text-muted-foreground">
                          Agricultural machinery and implements
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium leading-none">Claas</h4>
                        <p className="text-xs text-muted-foreground">
                          Harvesters and agricultural equipment
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium leading-none">Massey Ferguson</h4>
                        <p className="text-xs text-muted-foreground">
                          Tractors and agricultural machinery
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium leading-none">Fendt</h4>
                        <p className="text-xs text-muted-foreground">
                          High-tech agricultural equipment
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium leading-none">Kubota</h4>
                        <p className="text-xs text-muted-foreground">
                          Compact tractors and implements
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium leading-none">Other Brands</h4>
                        <p className="text-xs text-muted-foreground">
                          Additional equipment manufacturers
                        </p>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            
            <div className="space-y-2">
              <Label htmlFor="default-tractor-type">Default Tractor Type</Label>
              <Select defaultValue="utility">
                <SelectTrigger id="default-tractor-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="utility">Utility Tractor</SelectItem>
                  <SelectItem value="row-crop">Row Crop Tractor</SelectItem>
                  <SelectItem value="compact">Compact Tractor</SelectItem>
                  <SelectItem value="specialty">Specialty Tractor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="equipment-identification">Equipment Identification Format</Label>
              <Select defaultValue="farm-type-id">
                <SelectTrigger id="equipment-identification">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="farm-type-id">FARM-TYPE-ID</SelectItem>
                  <SelectItem value="year-make-model">YEAR-MAKE-MODEL</SelectItem>
                  <SelectItem value="custom">Custom Format</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Format used for equipment identification codes
              </p>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label htmlFor="track-implements">Track Implements Separately</Label>
                <p className="text-sm text-muted-foreground">
                  Manage implements as separate equipment items
                </p>
              </div>
              <Switch id="track-implements" defaultChecked />
            </div>
          </div>
        </div>
        <Button>Save Equipment Types</Button>
      </SettingsSection>

      <SettingsSection
        title="Standard Maintenance Cycles"
        description="Define default maintenance intervals for equipment types"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-secondary h-16 w-16 rounded-full flex items-center justify-center">
            <Wrench className="h-8 w-8 text-secondary-foreground" />
          </div>
          <div className="space-y-4 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium">Tractors</h3>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm">Oil Change</p>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="number" 
                          defaultValue="250" 
                          className="w-20 text-right" 
                        />
                        <span className="text-sm text-muted-foreground">hours</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm">Filter Replacement</p>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="number" 
                          defaultValue="500" 
                          className="w-20 text-right" 
                        />
                        <span className="text-sm text-muted-foreground">hours</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm">Full Service</p>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="number" 
                          defaultValue="1000" 
                          className="w-20 text-right" 
                        />
                        <span className="text-sm text-muted-foreground">hours</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium">Harvesters</h3>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm">Lubrication</p>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="number" 
                          defaultValue="50" 
                          className="w-20 text-right" 
                        />
                        <span className="text-sm text-muted-foreground">hours</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm">Belt Check</p>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="number" 
                          defaultValue="100" 
                          className="w-20 text-right" 
                        />
                        <span className="text-sm text-muted-foreground">hours</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm">Full Service</p>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="number" 
                          defaultValue="400" 
                          className="w-20 text-right" 
                        />
                        <span className="text-sm text-muted-foreground">hours</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-2 pt-2">
              <Label htmlFor="maintenance-calculation">Maintenance Scheduling Method</Label>
              <Select defaultValue="hours">
                <SelectTrigger id="maintenance-calculation">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hours">Engine Hours</SelectItem>
                  <SelectItem value="calendar">Calendar Days</SelectItem>
                  <SelectItem value="hybrid">Hybrid (Hours + Calendar)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label htmlFor="seasonal-adjust">Seasonal Adjustments</Label>
                <p className="text-sm text-muted-foreground">
                  Adjust maintenance frequency based on seasonal use
                </p>
              </div>
              <Switch id="seasonal-adjust" />
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label htmlFor="auto-schedule">Automatic Scheduling</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically generate maintenance tasks based on cycles
                </p>
              </div>
              <Switch id="auto-schedule" defaultChecked />
            </div>
          </div>
        </div>
        <Button>Save Maintenance Cycles</Button>
      </SettingsSection>

      <SettingsSection
        title="Operating Cost Parameters"
        description="Define default cost factors for equipment operations"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-secondary h-16 w-16 rounded-full flex items-center justify-center">
            <Coins className="h-8 w-8 text-secondary-foreground" />
          </div>
          <div className="space-y-4 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fuel-cost">Default Fuel Cost</Label>
                <div className="flex items-center gap-2">
                  <Input id="fuel-cost" type="number" defaultValue="1.85" />
                  <span className="text-sm text-muted-foreground">€/L</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="labor-cost">Default Labor Cost</Label>
                <div className="flex items-center gap-2">
                  <Input id="labor-cost" type="number" defaultValue="25" />
                  <span className="text-sm text-muted-foreground">€/hour</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="depreciation-method">Depreciation Calculation Method</Label>
              <Select defaultValue="straight-line">
                <SelectTrigger id="depreciation-method">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="straight-line">Straight Line</SelectItem>
                  <SelectItem value="declining-balance">Declining Balance</SelectItem>
                  <SelectItem value="sum-of-years">Sum of the Years' Digits</SelectItem>
                  <SelectItem value="usage-based">Usage-Based</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maintenance-factor">Maintenance Cost Factor</Label>
                <div className="flex items-center gap-2">
                  <Input id="maintenance-factor" type="number" defaultValue="0.12" />
                  <span className="text-sm text-muted-foreground">of purchase price/year</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="insurance-factor">Insurance & Tax Factor</Label>
                <div className="flex items-center gap-2">
                  <Input id="insurance-factor" type="number" defaultValue="0.02" />
                  <span className="text-sm text-muted-foreground">of purchase price/year</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label htmlFor="track-downtime">Track Downtime Costs</Label>
                <p className="text-sm text-muted-foreground">
                  Include opportunity costs for equipment downtime
                </p>
              </div>
              <Switch id="track-downtime" defaultChecked />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cost-reporting">Cost Reporting Period</Label>
              <Select defaultValue="monthly">
                <SelectTrigger id="cost-reporting">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <Button>Save Cost Parameters</Button>
      </SettingsSection>
    </div>
  );
};
