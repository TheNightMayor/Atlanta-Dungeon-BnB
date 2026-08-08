export type Message = {
  topic: string;
  text: string;
  name: string;
  user: { name: string };
  email: string;
  _createdAt: Date;
  _id: string;
};

export type CreateMessageDto = {
  topic: string;
  text: string;
  name: string;
  email: string;
  userId: string;
};