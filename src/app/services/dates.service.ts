import { Injectable } from '@angular/core';
import * as dayjs from 'dayjs';
import { BehaviorSubject, Observable, of } from 'rxjs';

interface dias {
  desde: [any | null, number[]];
  hasta: [any | null, number[]];
  precio: number;
  cantidadDias: number;
  diaSiguiente: any | null;
}
@Injectable({
  providedIn: 'root',
})
export class DatesService {
  private diasElegidos: BehaviorSubject<{
    desde: [any | null, number[]];
    hasta: [any | null, number[]];
    precio: number;
    cantidadDias: number;
    diaSiguiente: any | null;
  }> = new BehaviorSubject<{
    desde: [any | null, number[]];
    hasta: [any | null, number[]];
    precio: number;
    cantidadDias: number;
    diaSiguiente: any | null;
  }>({
    desde: [null, []],
    hasta: [null, []],
    precio: 0,
    cantidadDias: 0,
    diaSiguiente: null,
  });

  diasElegidos$: Observable<{
    desde: [any | null, number[]];
    hasta: [any | null, number[]];
    precio: number;
    cantidadDias: number;
    diaSiguiente: any | null;
  }> = this.diasElegidos;

  //esto va a venir de una base de datos
  diasOcupados$: Observable<string[]> = of([
    `8/9/2022`,
    `8/10/2022`,
    `8/12/2022`,
    `8/13/2022`,
    `8/23/2022`,
    `8/24/2022`,
    `9/9/2022`,
    `9/10/2022`,
    `9/12/2022`,
    `9/13/2022`,
    `9/23/2022`,
    `9/24/2022`,
    `10/9/2022`,
    `10/10/2022`,
    `10/12/2022`,
    `10/13/2022`,
    `10/23/2022`,
    `10/24/2022`,
    `11/9/2022`,
    `11/10/2022`,
    `11/12/2022`,
    `11/13/2022`,
    `11/23/2022`,
    `11/24/2022`,
  ]);

  constructor() {}

  removeDias() {
    let data: dias = {
      desde: [null, []],
      hasta: [null, []],
      precio: 0,
      cantidadDias: 0,
      diaSiguiente: null,
    };
    this.diasElegidos.next(data);
  }

  setDias(dias: {
    desde: [any | null, number[]];
    hasta: [any | null, number[]];
  }) {
    const data = { ...this.calcularCantidadDias(dias) };
    this.diasElegidos.next(data);
  }

  calcularCantidadDias(dias: {
    desde: [any | null, number[]];
    hasta: [any | null, number[]];
  }) {
    let cantidadDias = 0;
    let diaSiguiente = null;
    if (dias.desde[0] != null) {
      cantidadDias = dayjs(dias.hasta[0]).diff(dayjs(dias.desde[0]), 'day') + 1;

      diaSiguiente = dayjs(dias.hasta[0]).add(1, 'day');
    }

    let dataFinal: any = { ...dias };

    dataFinal.cantidadDias = cantidadDias;
    dataFinal.diaSiguiente = diaSiguiente;
    return dataFinal;
  }
}
