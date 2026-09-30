import { ChangeDetectionStrategy, HostListener, Component } from '@angular/core';
import { AstronautService } from './astronaut.service';
import { Observable } from 'rxjs';
import { Astronaut, FilterState, Filter, Option } from './types';
import { MatDialog } from '@angular/material/dialog';
import { AddAstronautComponent } from './add-astronaut/add-astronaut.component';

@Component({
standalone:false,changeDetection:ChangeDetectionStrategy.Eager,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isMobile = window.innerWidth < 700;
  @HostListener('window:resize') resized() { this.isMobile = window.innerWidth < 700; }
  photoUrl(astronaut: Astronaut) { return navigator.onLine ? astronaut.photo : 'assets/portrait-unavailable.svg'; }
  astronauts: Observable<Astronaut[]>;
  filterState: FilterState;
  filters: Observable<Filter[]>;

  constructor(astronautService: AstronautService, private dialog: MatDialog) {
    this.astronauts = astronautService.astronauts;
    this.filterState = astronautService.filterState;
    this.filters = astronautService.filters;
  }

  photoUnavailable(event: Event) {
    const image = event.target as HTMLImageElement;
    image.onerror = null;
    image.src = 'assets/portrait-unavailable.svg';
  }

  changeFilter(category: string, option: Option) {
    this.filterState[category] = option;
  }

  addAstronaut() {
    this.dialog.open(AddAstronautComponent, {
      width: '500px',
      ariaLabel: 'Add an astronaut'
    });
  }
}
