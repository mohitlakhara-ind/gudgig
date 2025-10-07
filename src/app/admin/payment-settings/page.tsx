'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  CreditCard, 
  Save, 
  Plus, 
  Trash2, 
  Settings,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface BidFeeOption {
  id: string;
  amount: number;
  label: string;
  isActive: boolean;
  isDefault: boolean;
}

interface PaymentSettings {
  razorpayKeyId: string;
  razorpayKeySecret: string;
  bidFeesEnabled: boolean;
  minimumBidFee: number;
  maximumBidFee: number;
  bidFeeOptions: BidFeeOption[];
  refundPolicy: string;
  currency: string;
}

export default function PaymentSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<PaymentSettings>({
    razorpayKeyId: '',
    razorpayKeySecret: '',
    bidFeesEnabled: true,
    minimumBidFee: 100, // ₹1 in paise
    maximumBidFee: 10000, // ₹100 in paise
    bidFeeOptions: [
      { id: '1', amount: 100, label: '₹1', isActive: true, isDefault: true },
      { id: '2', amount: 500, label: '₹5', isActive: true, isDefault: false },
      { id: '3', amount: 1000, label: '₹10', isActive: true, isDefault: false },
      { id: '4', amount: 2000, label: '₹20', isActive: false, isDefault: false },
    ],
    refundPolicy: 'non-refundable',
    currency: 'INR'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/payment-settings');
      // const data = await response.json();
      // setSettings(data);
      
      // Mock data for now
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } catch (error) {
      toast.error('Failed to load payment settings');
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // TODO: Replace with actual API call
      // await fetch('/api/admin/payment-settings', {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify(settings)
      // });
      
      // Mock save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Payment settings saved successfully');
    } catch (error) {
      toast.error('Failed to save payment settings');
    } finally {
      setSaving(false);
    }
  };

  const addBidFeeOption = () => {
    const newOption: BidFeeOption = {
      id: Date.now().toString(),
      amount: 0,
      label: '',
      isActive: true,
      isDefault: false
    };
    setSettings(prev => ({
      ...prev,
      bidFeeOptions: [...prev.bidFeeOptions, newOption]
    }));
  };

  const updateBidFeeOption = (id: string, updates: Partial<BidFeeOption>) => {
    setSettings(prev => ({
      ...prev,
      bidFeeOptions: prev.bidFeeOptions.map(option =>
        option.id === id ? { ...option, ...updates } : option
      )
    }));
  };

  const removeBidFeeOption = (id: string) => {
    setSettings(prev => ({
      ...prev,
      bidFeeOptions: prev.bidFeeOptions.filter(option => option.id !== id)
    }));
  };

  const setDefaultBidFee = (id: string) => {
    setSettings(prev => ({
      ...prev,
      bidFeeOptions: prev.bidFeeOptions.map(option => ({
        ...option,
        isDefault: option.id === id
      }))
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Loading payment settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Payment Settings</h1>
            <p className="text-muted-foreground">
              Configure payment gateway and bid fee settings
            </p>
          </div>

          <div className="space-y-6">
            {/* Razorpay Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Razorpay Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="razorpayKeyId">Razorpay Key ID</Label>
                    <Input
                      id="razorpayKeyId"
                      type="text"
                      value={settings.razorpayKeyId}
                      onChange={(e) => setSettings(prev => ({ ...prev, razorpayKeyId: e.target.value }))}
                      placeholder="rzp_test_..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="razorpayKeySecret">Razorpay Key Secret</Label>
                    <Input
                      id="razorpayKeySecret"
                      type="password"
                      value={settings.razorpayKeySecret}
                      onChange={(e) => setSettings(prev => ({ ...prev, razorpayKeySecret: e.target.value }))}
                      placeholder="Enter your secret key"
                    />
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-800 mb-1">Security Note</p>
                      <p className="text-blue-700">
                        Your Razorpay secret key is encrypted and stored securely. 
                        Never share these credentials with unauthorized personnel.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bid Fee Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Bid Fee Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="bidFeesEnabled">Enable Bid Fees</Label>
                    <p className="text-sm text-muted-foreground">
                      Require freelancers to pay a fee when submitting bids
                    </p>
                  </div>
                  <Switch
                    id="bidFeesEnabled"
                    checked={settings.bidFeesEnabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, bidFeesEnabled: checked }))}
                  />
                </div>

                {settings.bidFeesEnabled && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="minimumBidFee">Minimum Bid Fee (₹)</Label>
                        <Input
                          id="minimumBidFee"
                          type="number"
                          value={settings.minimumBidFee / 100}
                          onChange={(e) => setSettings(prev => ({ 
                            ...prev, 
                            minimumBidFee: Number(e.target.value) * 100 
                          }))}
                          min="1"
                          step="1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maximumBidFee">Maximum Bid Fee (₹)</Label>
                        <Input
                          id="maximumBidFee"
                          type="number"
                          value={settings.maximumBidFee / 100}
                          onChange={(e) => setSettings(prev => ({ 
                            ...prev, 
                            maximumBidFee: Number(e.target.value) * 100 
                          }))}
                          min="1"
                          step="1"
                        />
                      </div>
                    </div>

                    {/* Bid Fee Options */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Bid Fee Options</Label>
                        <Button onClick={addBidFeeOption} size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Option
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {settings.bidFeeOptions.map((option) => (
                          <div key={option.id} className="flex items-center gap-4 p-4 border rounded-lg">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <Label className="text-sm">Amount (₹)</Label>
                                <Input
                                  type="number"
                                  value={option.amount / 100}
                                  onChange={(e) => updateBidFeeOption(option.id, { 
                                    amount: Number(e.target.value) * 100,
                                    label: `₹${e.target.value}`
                                  })}
                                  min="1"
                                  step="1"
                                />
                              </div>
                              <div>
                                <Label className="text-sm">Label</Label>
                                <Input
                                  type="text"
                                  value={option.label}
                                  onChange={(e) => updateBidFeeOption(option.id, { label: e.target.value })}
                                  placeholder="₹5"
                                />
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    checked={option.isActive}
                                    onCheckedChange={(checked) => updateBidFeeOption(option.id, { isActive: checked })}
                                  />
                                  <Label className="text-sm">Active</Label>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setDefaultBidFee(option.id)}
                                  disabled={option.isDefault}
                                >
                                  {option.isDefault ? 'Default' : 'Set Default'}
                                </Button>
                              </div>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeBidFeeOption(option.id)}
                              disabled={option.isDefault}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Refund Policy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Refund Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="refundPolicy">Refund Policy</Label>
                  <select
                    id="refundPolicy"
                    value={settings.refundPolicy}
                    onChange={(e) => setSettings(prev => ({ ...prev, refundPolicy: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="non-refundable">Non-refundable (Default)</option>
                    <option value="refundable-24h">Refundable within 24 hours</option>
                    <option value="refundable-7d">Refundable within 7 days</option>
                    <option value="case-by-case">Case by case basis</option>
                  </select>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-800 mb-1">Policy Impact</p>
                      <p className="text-amber-700">
                        This setting affects the refund policy displayed to users and 
                        the refund processing workflow.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving} size="lg">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


