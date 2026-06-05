import { FieldValue, Timestamp } from "firebase/firestore";

export interface User {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  createdAt: Timestamp | FieldValue;
  updateAt: Timestamp | FieldValue;
}

export interface Interview {
  id: string;
  position: string;
  description: string;
  experience: number;
  userId: string;
  techStack: string;
  topics?: string;
  duration?: number;
  scheduledStart?: string;
  status?: "scheduled" | "in-progress" | "completed";
  questions: { question: string; answer: string }[];
  createdAt?: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
  updateAt?: Timestamp | FieldValue;
  // Session tracking
  stoppedEarly?: boolean;       // true if user manually ended before timer ran out
  timeTaken?: number;           // actual minutes spent in session
  endedAt?: Timestamp | FieldValue;
}

export interface UserAnswer {
  id: string;
  mockIdRef: string;
  question: string;
  correct_ans: string;
  user_ans: string;
  feedback: string;
  rating: number;
  userId: string;
  createdAt: Timestamp;
  updateAt: Timestamp;
}
