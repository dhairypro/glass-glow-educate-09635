import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Announcement {
  id: string;
  class_id: string;
  title: string;
  content: string;
  link?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  classes?: {
    title: string;
  };
}

export const useAnnouncements = (classId?: string) => {
  const queryClient = useQueryClient();

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['announcements', classId],
    queryFn: async () => {
      let query = supabase
        .from('announcements')
        .select(`
          *,
          classes:class_id (title)
        `)
        .order('created_at', { ascending: false });

      if (classId) {
        query = query.eq('class_id', classId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Announcement[];
    },
  });

  const createAnnouncement = useMutation({
    mutationFn: async (announcement: {
      class_id: string;
      title: string;
      content: string;
      link?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('announcements')
        .insert([{ ...announcement, created_by: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast({
        title: 'Success',
        description: 'Announcement created and students notified',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateAnnouncement = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      title?: string;
      content?: string;
      link?: string;
    }) => {
      const { data, error } = await supabase
        .from('announcements')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast({
        title: 'Success',
        description: 'Announcement updated',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteAnnouncement = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast({
        title: 'Success',
        description: 'Announcement deleted',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    announcements,
    isLoading,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
  };
};
