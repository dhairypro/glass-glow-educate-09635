import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IndianRupee, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface FeesCardProps {
  feeSummary: {
    total_fees: number;
    paid_amount: number;
    pending_amount: number;
    academic_year: string;
  } | null;
  feePayments: Array<{
    id: string;
    amount: number;
    payment_date: string;
    payment_method: string;
    transaction_reference: string | null;
  }>;
}

export const FeesCard = ({ feeSummary, feePayments }: FeesCardProps) => {
  const getPaymentStatus = () => {
    if (!feeSummary) return { text: 'No Fees', variant: 'secondary' as const, icon: AlertCircle };
    if (feeSummary.pending_amount === 0) return { text: 'Paid', variant: 'default' as const, icon: CheckCircle };
    if (feeSummary.paid_amount === 0) return { text: 'Unpaid', variant: 'destructive' as const, icon: AlertCircle };
    return { text: 'Partial', variant: 'secondary' as const, icon: Clock };
  };

  const status = getPaymentStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5" />
            Fee Summary
          </div>
          <Badge variant={status.variant} className="flex items-center gap-1">
            <status.icon className="h-3 w-3" />
            {status.text}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {feeSummary ? (
          <>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Total Fees</p>
                <p className="text-lg font-bold">₹{feeSummary.total_fees.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Paid</p>
                <p className="text-lg font-bold text-green-600">₹{feeSummary.paid_amount.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-lg font-bold text-orange-600">₹{feeSummary.pending_amount.toLocaleString()}</p>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-semibold mb-3">Payment History</h4>
              {feePayments.length > 0 ? (
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {feePayments.map((payment) => (
                      <div key={payment.id} className="p-3 rounded-lg border bg-muted/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">₹{payment.amount.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(payment.payment_date), 'PP')} • {payment.payment_method}
                            </p>
                            {payment.transaction_reference && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Ref: {payment.transaction_reference}
                              </p>
                            )}
                          </div>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-sm text-muted-foreground">No payments recorded yet</p>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No fee structure set for this student's class</p>
        )}
      </CardContent>
    </Card>
  );
};
