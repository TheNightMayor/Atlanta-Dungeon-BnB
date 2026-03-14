export type Message = {
  topic: string;
  text: string;
  user: { name: string };
  email: string;
  _createdAt: Date;
  _id: string;
};