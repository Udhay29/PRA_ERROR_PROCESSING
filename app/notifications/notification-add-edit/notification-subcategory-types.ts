export const notificationSubcategoryTypes: NotificationSubcategoryTypes = {
  'Commitment Expiration': { required: ['Days Till Expiration'] },
  'Commitment Review': { required: ['Weeks From Latest Active Effective Date'] }
};

interface NotificationSubcategoryTypes {
  [key: string]: NotificationSubcategoryType;
}

interface NotificationSubcategoryType {
  required: string[];
}