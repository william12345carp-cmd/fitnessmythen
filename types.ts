import { Timestamp } from "firebase/firestore";

export interface Registration {
  id?: string;
  name: string;
  email: string;
  createdAt: Timestamp | Date;
}

export interface Config {
  id?: string;
  spreadsheetId: string;
  connectedEmail: string;
  updatedAt: Timestamp | Date;
}

export interface CoachMessage {
  id: string;
  text: string;
  sender: "user" | "coach";
  timestamp: Date;
}
