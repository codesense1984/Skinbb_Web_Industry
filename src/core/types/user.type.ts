export interface SurveyUser {
  id: number;
  name: string;
  email: string;
  metroLocation: string;
  age: number;
  gender: string;
  skinType: string;
  city: string;
  appliedDate: string;
  timeTaken: string;
  status: "responded" | "opened";
  surveysParticipated: number;
  totalOrders: number;
  orderValue: number;
  surveyRewards: number;
}
