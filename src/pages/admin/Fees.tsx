import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, IndianRupee, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useClasses } from '@/hooks/useClasses';
import { useStudentsByClass } from '@/hooks/useStudentsByClass';
import { useFees } from '@/hooks/useFees';
import { format } from 'date-fns';

export default function Fees() {
  const navigate = useNavigate();
  const { classes } = useClasses();
  const { feeStructures, studentFeeSummary, feePayments, isLoading, createFeeStructure, recordPayment } = useFees();

  const [structureDialog, setStructureDialog] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);

  const [structureForm, setStructureForm] = useState({
    class_id: '',
    academic_year: new Date().getFullYear().toString(),
    amount: '',
    description: '',
  });

  const [selectedClassForPayment, setSelectedClassForPayment] = useState<string>('');
  const { students: classStudents } = useStudentsByClass(selectedClassForPayment || null);
  
  const [paymentForm, setPaymentForm] = useState({
    student_id: '',
    class_id: '',
    academic_year: new Date().getFullYear().toString(),
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    transaction_reference: '',
    remarks: '',
  });

  const handleStructureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createFeeStructure.mutateAsync({
      class_id: structureForm.class_id,
      academic_year: structureForm.academic_year,
      amount: parseFloat(structureForm.amount),
      description: structureForm.description || undefined,
    });
    setStructureForm({
      class_id: '',
      academic_year: new Date().getFullYear().toString(),
      amount: '',
      description: '',
    });
    setStructureDialog(false);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await recordPayment.mutateAsync({
      student_id: paymentForm.student_id,
      class_id: paymentForm.class_id,
      academic_year: paymentForm.academic_year,
      amount: parseFloat(paymentForm.amount),
      payment_date: paymentForm.payment_date,
      payment_method: paymentForm.payment_method,
      transaction_reference: paymentForm.transaction_reference || undefined,
      remarks: paymentForm.remarks || undefined,
    });
    setPaymentForm({
      student_id: '',
      class_id: '',
      academic_year: new Date().getFullYear().toString(),
      amount: '',
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
      transaction_reference: '',
      remarks: '',
    });
    setSelectedClassForPayment('');
    setPaymentDialog(false);
  };

  const getPaymentStatusBadge = (pending: number) => {
    if (pending <= 0) return <Badge className="bg-green-500">Paid</Badge>;
    if (pending > 0) return <Badge variant="destructive">Pending</Badge>;
    return <Badge variant="secondary">Unknown</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button variant="ghost" onClick={() => navigate('/admin')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Fees Management
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage fee structures and track payments
              </p>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList>
            <TabsTrigger value="summary">Student Summary</TabsTrigger>
            <TabsTrigger value="structures">Fee Structures</TabsTrigger>
            <TabsTrigger value="payments">Payment History</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Fee Status by Student</CardTitle>
                <CardDescription>Overview of all students' fee payments</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead className="text-right">Total Fees</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead className="text-right">Pending</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentFeeSummary?.map((summary) => (
                      <TableRow key={`${summary.student_id}-${summary.academic_year}`}>
                        <TableCell className="font-medium">{summary.student_name}</TableCell>
                        <TableCell>{summary.class_name}</TableCell>
                        <TableCell>{summary.academic_year}</TableCell>
                        <TableCell className="text-right">₹{summary.total_fees.toFixed(2)}</TableCell>
                        <TableCell className="text-right">₹{summary.paid_amount.toFixed(2)}</TableCell>
                        <TableCell className="text-right">₹{summary.pending_amount.toFixed(2)}</TableCell>
                        <TableCell>{getPaymentStatusBadge(summary.pending_amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="structures" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={structureDialog} onOpenChange={setStructureDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-primary to-accent">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Fee Structure
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Fee Structure</DialogTitle>
                    <DialogDescription>Define fees for a class and academic year</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleStructureSubmit} className="space-y-4">
                    <div>
                      <Label>Class</Label>
                      <Select
                        value={structureForm.class_id}
                        onValueChange={(value) => setStructureForm({ ...structureForm, class_id: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes?.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>{cls.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Academic Year</Label>
                      <Input
                        value={structureForm.academic_year}
                        onChange={(e) => setStructureForm({ ...structureForm, academic_year: e.target.value })}
                        placeholder="2024"
                        required
                      />
                    </div>

                    <div>
                      <Label>Total Fees Amount (₹)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={structureForm.amount}
                        onChange={(e) => setStructureForm({ ...structureForm, amount: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Input
                        value={structureForm.description}
                        onChange={(e) => setStructureForm({ ...structureForm, description: e.target.value })}
                        placeholder="Optional description"
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={createFeeStructure.isPending}>
                      {createFeeStructure.isPending ? 'Creating...' : 'Create Structure'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Fee Structures</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead className="text-right">Total Fees</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feeStructures?.map((structure) => (
                      <TableRow key={structure.id}>
                        <TableCell>{structure.classes?.title}</TableCell>
                        <TableCell>{structure.academic_year}</TableCell>
                        <TableCell className="text-right font-semibold">₹{structure.amount.toFixed(2)}</TableCell>
                        <TableCell className="text-muted-foreground">{structure.description || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-primary to-accent">
                    <Plus className="mr-2 h-4 w-4" />
                    Record Payment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Record Fee Payment</DialogTitle>
                    <DialogDescription>Record a student's fee payment</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <div>
                      <Label>Class</Label>
                      <Select
                        value={selectedClassForPayment}
                        onValueChange={(value) => {
                          setSelectedClassForPayment(value);
                          setPaymentForm({ ...paymentForm, class_id: value, student_id: '' });
                        }}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select class first" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes?.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>{cls.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Student</Label>
                      <Select
                        value={paymentForm.student_id}
                        onValueChange={(value) => setPaymentForm({ ...paymentForm, student_id: value })}
                        required
                        disabled={!selectedClassForPayment}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={selectedClassForPayment ? "Select student" : "Select class first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {classStudents?.map((student) => (
                            <SelectItem key={student.user_id} value={student.user_id}>
                              {student.full_name} {student.roll_no ? `(Roll: ${student.roll_no})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Academic Year</Label>
                      <Input
                        value={paymentForm.academic_year}
                        onChange={(e) => setPaymentForm({ ...paymentForm, academic_year: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label>Amount (₹)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={paymentForm.amount}
                        onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label>Payment Date</Label>
                      <Input
                        type="date"
                        value={paymentForm.payment_date}
                        onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label>Payment Method</Label>
                      <Select
                        value={paymentForm.payment_method}
                        onValueChange={(value) => setPaymentForm({ ...paymentForm, payment_method: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="online">Online</SelectItem>
                          <SelectItem value="cheque">Cheque</SelectItem>
                          <SelectItem value="upi">UPI</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Transaction Reference</Label>
                      <Input
                        value={paymentForm.transaction_reference}
                        onChange={(e) => setPaymentForm({ ...paymentForm, transaction_reference: e.target.value })}
                        placeholder="Optional"
                      />
                    </div>

                    <div>
                      <Label>Remarks</Label>
                      <Input
                        value={paymentForm.remarks}
                        onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                        placeholder="Optional"
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={recordPayment.isPending}>
                      {recordPayment.isPending ? 'Recording...' : 'Record Payment'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feePayments?.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{format(new Date(payment.payment_date), 'PP')}</TableCell>
                        <TableCell>{payment.profiles?.full_name}</TableCell>
                        <TableCell>{payment.classes?.title}</TableCell>
                        <TableCell>{payment.academic_year}</TableCell>
                        <TableCell className="text-right">₹{payment.amount.toFixed(2)}</TableCell>
                        <TableCell className="capitalize">{payment.payment_method}</TableCell>
                        <TableCell className="text-muted-foreground">{payment.transaction_reference || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
