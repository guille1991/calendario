import { DatesService } from './../../services/dates.service';
import { Component, OnInit } from '@angular/core';
import * as dayjs from 'dayjs';
import { MatDivider } from '@angular/material/divider';

@Component({
  selector: 'app-reserva',
  templateUrl: './reserva.component.html',
  styleUrls: ['./reserva.component.css'],
})
export class ReservaComponent implements OnInit {
  precio: number = 9000;
  cantidadDias: number = 0;
  fechas: { desde: any | null; hasta: any | null } = {
    desde: null,
    hasta: null,
  };
  fechaSiguiente: any | null = null;

  constructor(private datesService: DatesService) {}

  ngOnInit(): void {
    this.datesService.diasElegidos$.subscribe((e) => {
      this.fechas = { desde: e.desde[0], hasta: e.hasta[0] };
      this.cantidadDias = e.cantidadDias;
      this.fechaSiguiente = e.diaSiguiente;
    });
  }
}
