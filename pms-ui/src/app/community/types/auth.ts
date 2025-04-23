export interface UserBasicInfo {
    id: string; // Or _id if backend uses that alias primarily in responses
    user_name?: string;
    role: "admin" | "faculty" | "student" | "alumni";
  }