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
      if (e.desde[0] && e.hasta[0]) {
        this.cantidadDias =
          dayjs(e.hasta[0]).diff(dayjs(e.desde[0]), 'day') + 1;
        this.fechas = { desde: e.desde[0], hasta: e.hasta[0] };
        this.fechaSiguiente = dayjs(e.hasta[0]).add(1, 'day');
      } else {
        this.cantidadDias = 0;
        this.fechas = { desde: null, hasta: null };
        this.fechaSiguiente = null;
      }
    });
  }
}
