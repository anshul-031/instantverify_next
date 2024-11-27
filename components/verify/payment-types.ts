export interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
  verificationId?: string;
}

export interface PaymentResponse {
  orderId: string;
  key: string;
  transactionId: string;
}