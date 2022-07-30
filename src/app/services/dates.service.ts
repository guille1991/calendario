import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

interface dias {
  desde: [any | null, number[]];
  hasta: [any | null, number[]];
}
@Injectable({
  providedIn: 'root',
})
export class DatesService {
  private diasElegidos: BehaviorSubject<{
    desde: [any | null, number[]];
    hasta: [any | null, number[]];
  }> = new BehaviorSubject<{
    desde: [any | null, number[]];
    hasta: [any | null, number[]];
  }>({
    desde: [null, []],
    hasta: [null, []],
  });
  diasElegidos$: Observable<{
    desde: [any | null, number[]];
    hasta: [any | null, number[]];
  }> = this.diasElegidos;
  constructor() {}

  setDias(dias: dias) {
    this.diasElegidos.next(dias);
  }
}
