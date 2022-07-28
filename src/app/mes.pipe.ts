import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mes',
})
export class MesPipe implements PipeTransform {
  transform(value: number): string {
    const meses = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    return meses[value - 1];
  }
}
