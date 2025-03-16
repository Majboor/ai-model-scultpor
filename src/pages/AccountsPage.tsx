
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { createPayment } from '@/services/paymentAPI';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Sparkles, LogOut, CreditCard, AlertTriangle, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Header from '@/components/Header';

const AccountsPage = () => {
  const { user, isSubscribed, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleSubscribe = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await createPayment();
      setPaymentUrl(response.payment_url);
      window.open(response.payment_url, '_blank');
    } catch (error) {
      console.error('Error creating payment:', error);
      toast({
        title: "Payment Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>
        
        <div className="grid gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>Subscription Details</span>
                {isSubscribed && (
                  <Badge variant="default" className="bg-gradient-to-r from-primary to-blue-400 px-2 py-1 ml-2">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Your current plan and subscription information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border p-4 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {isSubscribed ? "Premium Plan" : "Free Plan"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isSubscribed 
                        ? "Unlimited AI model generation"
                        : "Limited to 1 free AI model generation"}
                    </p>
                  </div>
                  <div>
                    {isSubscribed ? (
                      <Badge className="bg-primary/20 text-primary border-primary/30 py-1 px-3">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-muted/20 text-muted-foreground py-1 px-3">
                        Limited
                      </Badge>
                    )}
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Feature</TableHead>
                      <TableHead>Availability</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>AI Model Generation</TableCell>
                      <TableCell>
                        {isSubscribed ? (
                          <span className="flex items-center text-primary">
                            <Check className="h-4 w-4 mr-1" />
                            Unlimited
                          </span>
                        ) : (
                          <span className="flex items-center text-muted-foreground">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            1 Free Trial
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Premium Support</TableCell>
                      <TableCell>
                        {isSubscribed ? (
                          <span className="flex items-center text-primary">
                            <Check className="h-4 w-4 mr-1" />
                            Included
                          </span>
                        ) : (
                          <span className="flex items-center text-muted-foreground">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Not Available
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Download High Quality Models</TableCell>
                      <TableCell>
                        {isSubscribed ? (
                          <span className="flex items-center text-primary">
                            <Check className="h-4 w-4 mr-1" />
                            Included
                          </span>
                        ) : (
                          <span className="flex items-center text-muted-foreground">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Not Available
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-4 sm:justify-between">
              {isSubscribed ? (
                <div className="text-sm text-muted-foreground w-full sm:w-auto">
                  <p>You're on the Premium Plan. Enjoy unlimited access!</p>
                </div>
              ) : (
                <Button 
                  className="w-full sm:w-auto"
                  onClick={handleSubscribe}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    "Processing..."
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Upgrade to Premium ($14/month)
                    </>
                  )}
                </Button>
              )}
              <Button 
                variant="outline" 
                className="w-full sm:w-auto"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Your personal account details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <span className="font-medium">{user?.email}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Account ID</span>
                  <span className="font-medium text-xs sm:text-sm overflow-hidden text-ellipsis">{user?.id}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AccountsPage;
