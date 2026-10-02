export interface ReportFormValues {
  AccesionNumber: string;
  Key: string;
}

export interface NotificationState {
  type: 'success' | 'error';
  title: string;
  message: string;
}
