import { TableColumns } from './table-columns';

export class Drivermodel {
  tableColumns: TableColumns[];
  displayColumns: boolean;
  isSearchDone: boolean;

  constructor() {
    this.initializeTableColumns();
    this.isSearchDone = false;
  }

  initializeTableColumns() {
    this.tableColumns = [
      { columnId: 1, field: 'fullName', header: 'Name', visible: true },
      { columnId: 2, field: 'status', header: 'Status', visible: true },
      {
        columnId: 3,
        field: 'businessUnit',
        header: 'BusinessUnit',
        visible: true
      }
    ];
  }
}
