export function hasWaitingTx(status: any) {
  return 'WaitingTx' in status && status.WaitingTx > 0;
}