export interface SavedWorkoutPlan {
  _id?: string;     // موجود لو الخطة من MongoDB
  id?: string;      // موجود لو الخطة محلية
  name: string;
  split: string;
  goal: string;
  experience: string;
  daysPerWeek: number;
  createdAt: string;
  planData: any;
}
