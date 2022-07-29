import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DatesService {
  private diasElegidos: BehaviorSubject<{
    desde: any | null;
    hasta: any | null;
  }> = new BehaviorSubject<{ desde: any | null; hasta: any | null }>({
    desde: null,
    hasta: null,
  });
  diasElegidos$: Observable<{
    desde: any | null;
    hasta: any | null;
  }> = this.diasElegidos;
  constructor() {}

  setDias(dias: any) {
    this.diasElegidos.next(dias);
  }
}
