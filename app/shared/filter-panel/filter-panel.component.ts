import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Filter } from './filter/filter.model';

@Component({
  selector: 'filter-panel',
  templateUrl: './filter-panel.component.html',
  styleUrls: ['./filter-panel.component.scss']
})
export class FilterPanelComponent implements OnInit {

  @Input('filters')
  filters: Filter[];

  @Input('filter-state')
  filterState: Filter[];

  @Output('onFilterChange')
  onFilterChange: EventEmitter<Filter> = new EventEmitter<Filter>();

  constructor() { }

  ngOnInit() { }

  optionClicked( filter ) {
    this.onFilterChange.emit( filter );
  }

  resetFilters( event: Event ) {
    event.preventDefault();
    event.stopPropagation();
    this.filters.forEach( (filter: Filter) => {
      filter.reset();
      this.onFilterChange.emit(filter);
    });
  }

  getStateIfActive( filter: Filter): Filter {
    const activeFilter: Filter = this.filterState.find( (activeFilterObj: Filter) => activeFilterObj.name === filter.name );
    return activeFilter ? activeFilter : filter;
  }
}
