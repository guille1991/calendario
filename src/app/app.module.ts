import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MesPipe } from './mes.pipe';
import { PaginadorPipe } from './paginador.pipe';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ReservaComponent } from './components/reserva/reserva.component';
import { MatDividerModule } from '@angular/material/divider';
import { CalendarioComponent } from './components/calendario/calendario.component';

@NgModule({
  declarations: [AppComponent, MesPipe, PaginadorPipe, ReservaComponent, CalendarioComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDividerModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
