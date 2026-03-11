export interface TimeEntry {
  id: string;
  title: string;
  categoryId: string;
  date: string;
  minutes: number;
  notes?: string;
  createdAt: string;
}
