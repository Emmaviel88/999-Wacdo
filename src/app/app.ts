import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommuneListComponent } from './components/commune-list/commune-list.component';
import { MapComponent } from './components/map/map.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommuneListComponent, MapComponent],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.css',
  styles: [`
    :host {
      display: flex;
      width: 100%;
      height: 100vh;
    }
  `]
})
export class App {
  protected readonly title = signal('Francis & Co');
}
