import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Link as LinkIcon, ExternalLink, Trash2, Search, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useClasses } from '@/hooks/useClasses';
import { useSubjects } from '@/hooks/useSubjects';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const normalizeUrl = (url: string): string => {
  const trimmed = url.trim();
  if (!trimmed) return '';
  
  if (trimmed.match(/^https?:\/\//i)) {
    return trimmed;
  }
  
  return `https://${trimmed}`;
};

export default function Files() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { classes } = useClasses();
  const queryClient = useQueryClient();
  const [parentType, setParentType] = useState<'class' | 'subject' | 'chapter'>('class');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedParentId, setSelectedParentId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [fileLink, setFileLink] = useState('');
  const [fileTitle, setFileTitle] = useState('');

  const { subjects } = useSubjects(selectedClass);

  const { data: files } = useQuery({
    queryKey: ['files', parentType, selectedParentId],
    queryFn: async () => {
      if (!selectedParentId) return [];
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('parent_type', parentType)
        .eq('parent_id', selectedParentId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedParentId,
  });

  const addLinkMutation = useMutation({
    mutationFn: async () => {
      if (!fileLink || !selectedParentId || !fileTitle) {
        throw new Error('Please provide both title and link');
      }

      const normalizedUrl = normalizeUrl(fileLink);
      
      try {
        new URL(normalizedUrl);
      } catch {
        throw new Error('Please enter a valid URL');
      }

      const { error } = await supabase.from('files').insert({
        parent_type: parentType,
        parent_id: selectedParentId,
        title: fileTitle,
        file_url: normalizedUrl,
        file_type: 'link',
        uploaded_by: user?.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast({ title: 'Link added successfully' });
      setIsUploadOpen(false);
      setFileLink('');
      setFileTitle('');
    },
    onError: (error: any) => {
      toast({ title: 'Error adding link', description: error.message, variant: 'destructive' });
    },
  });

  const deleteFile = useMutation({
    mutationFn: async (file: any) => {
      const { error } = await supabase.from('files').delete().eq('id', file.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast({ title: 'Link deleted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error deleting link', description: error.message, variant: 'destructive' });
    },
  });

  const openLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const filteredFiles = files?.filter((file) =>
    file.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin')} className="shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold gradient-text">Files Management</h1>
        </div>

        <Card className="glass-card animate-slide-up">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Course Materials</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                </Button>
                <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Add Link
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add File Link</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Parent Type</Label>
                        <Select value={parentType} onValueChange={(value: any) => setParentType(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="class">Class</SelectItem>
                            <SelectItem value="subject">Subject</SelectItem>
                            <SelectItem value="chapter">Chapter</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {parentType === 'class' && (
                        <div>
                          <Label>Select Class</Label>
                          <Select value={selectedParentId} onValueChange={setSelectedParentId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select class" />
                            </SelectTrigger>
                            <SelectContent>
                              {classes?.map((cls) => (
                                <SelectItem key={cls.id} value={cls.id}>
                                  {cls.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      {parentType === 'subject' && (
                        <>
                          <div>
                            <Label>Select Class</Label>
                            <Select value={selectedClass} onValueChange={setSelectedClass}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select class" />
                              </SelectTrigger>
                              <SelectContent>
                                {classes?.map((cls) => (
                                  <SelectItem key={cls.id} value={cls.id}>
                                    {cls.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Select Subject</Label>
                            <Select value={selectedParentId} onValueChange={setSelectedParentId}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select subject" />
                              </SelectTrigger>
                              <SelectContent>
                                {subjects?.map((subject) => (
                                  <SelectItem key={subject.id} value={subject.id}>
                                    {subject.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}
                      <div>
                        <Label>File Title</Label>
                        <Input
                          placeholder="e.g., Chapter 1 Notes"
                          value={fileTitle}
                          onChange={(e) => setFileTitle(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>File Link (Google Drive, Dropbox, etc.)</Label>
                        <Input
                          placeholder="https://drive.google.com/... or youtube.com"
                          value={fileLink}
                          onChange={(e) => setFileLink(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Enter full URL or domain (https:// will be added automatically)
                        </p>
                      </div>
                      <Button
                        onClick={() => addLinkMutation.mutate()}
                        disabled={!fileLink || !selectedParentId || !fileTitle}
                        className="w-full"
                      >
                        Add Link
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Filter by Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes?.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Filter by Subject</Label>
                <Select value={selectedSubject} onValueChange={(value) => {
                  setSelectedSubject(value);
                  setSelectedParentId(value);
                  setParentType('subject');
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects?.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Search Files</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {filteredFiles && filteredFiles.length > 0 ? (
              <div className="rounded-md border overflow-hidden">
                <ScrollArea className="w-full h-[calc(100vh-450px)]">
                  <ScrollBar orientation="horizontal" />
                  <div className="min-w-[700px]">
                    <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Uploaded At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFiles.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell>{file.title}</TableCell>
                      <TableCell>{file.file_type}</TableCell>
                      <TableCell>{format(new Date(file.created_at), 'PPP')}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openLink(file.file_url)}
                            title="Open link in new tab"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteFile.mutate(file)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                    </Table>
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {selectedParentId ? 'No files found' : 'Select a class or subject to view files'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
