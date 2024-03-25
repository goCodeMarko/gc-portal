export enum TransactionStatus {
  Pending = 1,
  Approved = 2,
  Failed = 3,
  Cancelled = 4,
}
export const TransactionStatusLabels: { [key: number]: string } = {
  [TransactionStatus.Pending]: "Pending",
  [TransactionStatus.Approved]: "Approved",
  [TransactionStatus.Failed]: "Failed",
  [TransactionStatus.Cancelled]: "Cancelled",
};
