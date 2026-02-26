export enum QueueNames {
  APPOINTMENT = 'appointment',
  REPORT = 'report',
  APPOINTMENT_DLQ = 'appointment-dlq', // Dead Letter Queue
}

export const JobNames = {
  SCHEDULE_APPOINTMENT: 'schedule-appointment',
  APPOINTMENT_DIGEST: 'appointment-digest',
  DEAD_LETTER: 'dead-letter',
  GENERATE_REPORT: 'generate-report'
};