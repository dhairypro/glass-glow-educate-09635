import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Megaphone, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClasses } from '@/hooks/useClasses';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { format } from 'date-fns';

export default function Announcements() {
  const navigate = useNavigate();
  const { classes } = useClasses();
  const { announcements, isLoading, createAnnouncement, deleteAnnouncement } = useAnnouncements();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    class_id: '',
    title: '',
    content: '',
    link: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAnnouncement.mutateAsync({
      class_id: formData.class_id,
      title: formData.title,
      content: formData.content,
      link: formData.link || undefined,
    });
    setFormData({ class_id: '', title: '', content: '', link: '' });
    setIsDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/admin')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Announcements
              </h1>
              <p className="text-muted-foreground mt-2">
                Create and manage announcements for students
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-accent">
                  <Plus className="mr-2 h-4 w-4" />
                  New Announcement
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Announcement</DialogTitle>
                  <DialogDescription>
                    Post an announcement that will notify all students in the selected class
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="class">Class</Label>
                    <Select
                      value={formData.class_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, class_id: value })
                      }
                      required
                    >
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
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="Announcement title"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      placeholder="Announcement details..."
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="link">Link (Optional)</Label>
                    <Input
                      id="link"
                      type="url"
                      value={formData.link}
                      onChange={(e) =>
                        setFormData({ ...formData, link: e.target.value })
                      }
                      placeholder="https://example.com"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createAnnouncement.isPending}
                  >
                    {createAnnouncement.isPending ? 'Creating...' : 'Create Announcement'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        <div className="grid gap-4">
          {isLoading ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Loading announcements...</p>
              </CardContent>
            </Card>
          ) : announcements && announcements.length > 0 ? (
            announcements.map((announcement) => (
              <motion.div
                key={announcement.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Megaphone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{announcement.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {announcement.classes?.title} •{' '}
                            {format(new Date(announcement.created_at), 'PPP')}
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteAnnouncement.mutate(announcement.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground whitespace-pre-wrap">{announcement.content}</p>
                    {announcement.link && (
                      <Button
                        variant="link"
                        className="mt-2 p-0 h-auto"
                        onClick={() => window.open(announcement.link, '_blank', 'noopener,noreferrer')}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Link
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No announcements yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
