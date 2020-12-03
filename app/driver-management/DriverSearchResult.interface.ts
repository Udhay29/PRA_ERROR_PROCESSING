import { Driver } from './driver-management.model';

export interface DriverSearchResult {
  hitCount: number;
  employees: Driver[];
}
