export interface PaystackEvent {
  event: string;
  data: {
    amount: number;
  };
}
