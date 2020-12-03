import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { TableColumns } from '../../driver-management/table-columns';
import {LocalStorageService} from 'lib-platform-services';

@Component({
  selector: 'admin-manage-columns',
  templateUrl: './manage-columns.component.html',
  styleUrls: ['./manage-columns.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageColumnsComponent {
  @Input() displayColumns: boolean;
  @Input() manageColumnsList: TableColumns[];
  @Output() displayColumnsChange = new EventEmitter();
  constructor(private readonly localStorageService: LocalStorageService) {}

  public onVisibleToggle(columnJsonArg: TableColumns) {
    if (columnJsonArg.visible) {
      const arrayIndex: number = this.checkAndReturnValidColumn(columnJsonArg);
      if (arrayIndex > -1) {
        columnJsonArg.visible = false;
        this.manageColumnsList[arrayIndex].visible = false;
      }
    } else {
      columnJsonArg.visible = true;
      this.manageColumnsList.forEach((thisColumn: TableColumns) => {
        if (columnJsonArg.visible === thisColumn.visible) {
          thisColumn.visible = true;
        }
      });
    }
  }

  private checkAndReturnValidColumn(selectedColumn: TableColumns): number {
    const visibleColumns: Array<TableColumns> = this.manageColumnsList.filter(
      (thisObj: TableColumns) => thisObj.visible
    );
    if (visibleColumns.length > 1) {
      return this.manageColumnsList.findIndex(
        (thisObject: TableColumns) => thisObject.columnId === selectedColumn.columnId
      );
    } else {
      return -1;
    }
  }

  deleteColumn(columnID: number) {
    const index = this.manageColumnsList.findIndex(column => column.columnId === columnID);
    this.manageColumnsList.splice(index, 1);
  }

  onSave() {
    this.displayColumnsChange.emit(this.manageColumnsList);
  }

  cancel() {
    this.displayColumns = false;
    this.displayColumnsChange.emit(null);
  }
}
