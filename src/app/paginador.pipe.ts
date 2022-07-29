import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'paginador',
})
export class PaginadorPipe implements PipeTransform {
  transform(value: any[], primerMes: number = 0): any[] {
    return value.slice(primerMes, primerMes + 2);
  }
}
