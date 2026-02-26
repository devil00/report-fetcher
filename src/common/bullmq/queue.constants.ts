export enum QueueNames {
  APPOINTMENT = 'appointment',
  REPORT = 'report',
  APPOINTMENT_DLQ = 'appointment-dlq', // Dead Letter Queue
}

export const JobNames = {
  DEAD_LETTER: 'dead-letter',
  GENERATE_REPORT: 'generate-report'
};