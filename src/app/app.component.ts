import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthService } from './auth.service';
@Component({
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  menuOpen = false;
  constructor(public auth: AuthService) {}
}
