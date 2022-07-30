import { Observable } from 'rxjs';
import { DatesService } from './services/dates.service';
import { Component, OnInit } from '@angular/core';
import * as dayjs from 'dayjs';
import * as isoWeek from 'dayjs/plugin/isoWeek';
import 'dayjs/locale/es';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
dayjs.extend(isoWeek);
dayjs.locale('es');

interface dia {
  date: Date;
  indexNumeroSemana: number;
  numeroDia: number;
  numeroMes: number;
  numeroAnio: number;
  disponibilidad: boolean;
  seleccionado: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'calendario-interactivo';
  numbers: any[] = [];
  calendar: any[] = [];
  primerMes: number = 0;
  cantidadDias: number = 0;
  diaSiguiente: any | null;
  texto: string = '';
  // diasElegidos: { desde: any | null; hasta: any | null } = {
  //   desde: null,
  //   hasta: null,
  // };
  diasDesde: [any | null, number[]] = [null, []];
  diasHasta: [any | null, number[]] = [null, []];

  diasElegidos$!: Observable<{ desde: any | null; hasta: any | null }>;

  dias: string[] = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
  ];
  day: any;

  constructor(
    private datesService: DatesService,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.diasElegidos$ = this.datesService.diasElegidos$;
    this.getFullCalendar();
    this.disableAvailabilityofFirstMonth();

    this.datesService.diasElegidos$.pipe().subscribe((e) => {
      //console.log(e, e.desde, e.hasta);
      e.desde[0] != null
        ? (this.diasDesde[0] = dayjs(e.desde[0]))
        : (this.diasDesde[0] = null);
      e.hasta[0] != null
        ? (this.diasHasta[0] = dayjs(e.hasta[0]))
        : (this.diasHasta[0] = null);

      this.cantidadDias = 0;
      if (e.desde[0] != null && e.hasta[0] != null) {
        this.cantidadDias =
          dayjs(this.diasHasta[0]).diff(dayjs(this.diasDesde[0]), 'day') + 1;

        this.diaSiguiente = dayjs(this.diasHasta[0]).add(1, 'day');
      } else if (e.desde[0] != null) {
        this.cantidadDias = 1;
        this.diaSiguiente = dayjs(this.diasDesde[0]).add(1, 'day');
      }

      if (this.cantidadDias == 1) {
        this.texto = 'noche';
      } else {
        this.texto = 'noches';
      }
    });
  }

  selectDay(dia: dia, indexMes: number, indexDia: number) {
    indexMes = indexMes + this.primerMes;
    const indexMesDia = [indexMes, indexDia];
    //console.log(dia, indexMesDia);
    if (dia.disponibilidad == false) {
      return;
    }
    //console.log(this.diasDesde);
    if (this.diasDesde[0] == null) {
      dia.seleccionado = true;
      this.diasDesde = [dayjs(dia.date), indexMesDia];
      this.datesService.setDias({
        desde: this.diasDesde,
        hasta: this.diasHasta,
      });
      return;
    }

    //si la fecha es la misma que la final, que la fecha sea la de inicio
    if (dayjs(dia.date).isSame(dayjs(this.diasHasta[0]))) {
      this.cleanCalendar();
      dia.seleccionado = true;
      this.diasDesde = [dayjs(dia.date), indexMesDia];
      this.diasHasta = [null, []];
      this.datesService.setDias({
        desde: this.diasDesde,
        hasta: this.diasHasta,
      });
      return;
    }

    //si la fecha es anterior a la de inicio, la fecha es ahora la de inicio
    if (dayjs(dia.date).isBefore(dayjs(this.diasDesde[0]))) {
      this.cleanCalendar();
      dia.seleccionado = true;
      this.diasDesde = [dayjs(dia.date), indexMesDia];
      this.diasHasta = [null, []];
      this.datesService.setDias({
        desde: this.diasDesde,
        hasta: this.diasHasta,
      });
      return;
    }

    //si la fecha es igual a la de inicio, que se limpien los dias elegidos
    if (dayjs(dia.date).isSame(dayjs(this.diasDesde[0]))) {
      this.cleanCalendar();
      if (this.diasHasta[0] == null) {
        this.diasDesde = [null, []];
        this.datesService.setDias({
          desde: this.diasDesde,
          hasta: this.diasHasta,
        });
      } else {
        dia.seleccionado = true;
        this.diasDesde = [dayjs(dia.date), indexMesDia];
        this.diasHasta = [null, []];
        this.datesService.setDias({
          desde: this.diasDesde,
          hasta: this.diasHasta,
        });
      }
      return;
    }

    if (dayjs(dia.date).isAfter(this.diasDesde[0])) {
      //si la fecha es mayor a la de inicio
      //y es menor que la de fin o si la de fin no existe
      if (this.diasHasta[0] === null) {
        this.diasHasta = [dayjs(dia.date), indexMesDia];
        this.datesService.setDias({
          desde: this.diasDesde,
          hasta: this.diasHasta,
        });
        this.paintCalendarGap(this.diasDesde[1], this.diasHasta[1]);

        return;
      }
      //si la fecha es mayor que la de fin, la fecha es el nuevo fin
      if (dayjs(dia.date).isAfter(this.diasHasta[0])) {
        this.diasHasta = [dayjs(dia.date), indexMesDia];
        this.datesService.setDias({
          desde: this.diasDesde,
          hasta: this.diasHasta,
        });
        this.paintCalendarGap(this.diasDesde[1], this.diasHasta[1]);
        //si la fecha es menor a la de fin, la fecha es el nuevo fin
      } else if (dayjs(dia.date).isBefore(this.diasHasta[0])) {
        this.cleanCalendar();
        this.diasHasta = [dayjs(dia.date), indexMesDia];
        this.datesService.setDias({
          desde: this.diasDesde,
          hasta: this.diasHasta,
        });
      }
    }
  }

  cleanCalendar() {
    this.calendar.forEach((mes) => {
      mes.map((dia: any) => {
        if (dia.seleccionado == true) {
          dia.seleccionado = false;
        }
      });
    });
  }

  paintCalendarGap(indexInicio: number[], indexFin: number[]) {
    let redFlag = false;
    //console.log('indexInicio', indexInicio, 'indexFin', indexFin);
    outer_loop: for (let i = indexInicio[0]; i <= indexFin[0]; i++) {
      // console.log(indexInicio[1], indexFin[1]);
      // if (indexInicio[1] < indexFin[1]) {
      //   console.log(this.calendar[i][indexInicio[1]]);
      //   this.calendar[i][indexInicio[1]].seleccionado = true;
      //   indexInicio[1]++;

      // }

      if (i == indexInicio[0] && i != indexFin[0]) {
        console.log('el mes es igual al de inicio ');
        for (let j = indexInicio[1]; j < this.calendar[i].length; j++) {
          if (this.calendar[i][j].disponibilidad == true) {
            this.calendar[i][j].seleccionado = true;
          } else {
            redFlag = true;
            break outer_loop;
          }
        }
      } else if (i == indexInicio[0] && i == indexFin[0]) {
        console.log('el mes es igual al de inicio y igual al de fin');
        for (let j = indexInicio[1]; j <= indexFin[1]; j++) {
          //       //console.log(this.calendar[i][j]);
          if (this.calendar[i][j].disponibilidad == true) {
            this.calendar[i][j].seleccionado = true;
          } else {
            redFlag = true;
            break outer_loop;
          }
        }
      } else if (i == indexFin[0]) {
        console.log('el mes es igual al de fin');
        for (let j = 0; j <= indexFin[1]; j++) {
          //       //console.log(this.calendar[i][j]);
          if (this.calendar[i][j].disponibilidad == true) {
            this.calendar[i][j].seleccionado = true;
          } else {
            redFlag = true;
            break outer_loop;
          }
        }
      }

      if (i != indexInicio[0] && i != indexFin[0]) {
        console.log('el mes esta en el medio');
        for (let j = 0; j < this.calendar[i].length; j++) {
          if (this.calendar[i][j].disponibilidad == true) {
            this.calendar[i][j].seleccionado = true;
          } else {
            redFlag = true;
            break outer_loop;
          }
        }
      }
    }

    if (redFlag) {
      this.cleanCalendar();
      this.diasHasta = [null, []];
      this.datesService.setDias({
        desde: this.diasDesde,
        hasta: this.diasHasta,
      });
      this.paintCalendarGap(this.diasDesde[1], this.diasDesde[1]);

      let action = '';
      let config: MatSnackBarConfig = {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['alerta'],
      };
      this._snackBar.open(
        'Hay días no disponibles entre el rango de fechas',
        action,
        config
      );
    }

    // outer_loop: for (let i = indexMes; i >= 0; i--) {
    //   for (let j = indexDia; j >= 0; j--) {
    //     if (this.calendar[i][j].disponible === false) {
    //     }
    //     this.calendar[i][j].seleccionado = true;
    //     if (dayjs(this.calendar[i][j].date).isSame(dayjs(this.diasDesde[0]))) {
    //       break outer_loop;
    //     }
    //   }
    //   indexDia = this.calendar[i - 1].length - 1;
    // }
  }

  getFullCalendar() {
    let month = dayjs().month() + 1;
    let year = dayjs().year();
    for (let index = 0; index <= 12; index++) {
      if (month === 13) {
        month = 1;
        year++;
      }
      this.calendar.push(this.getMonthInfo(month, year));
      month++;
    }
  }

  disableAvailabilityofFirstMonth() {
    this.calendar[0].forEach((e: dia) => {
      if (e.numeroDia < dayjs().date()) {
        e.disponibilidad = false;
      }
    });
  }

  getMonthInfo(month: number, year: number) {
    const diaFinalDelMes = dayjs(`${month}-1-${year}`).daysInMonth();

    const arrayDays = Object.keys([...Array(diaFinalDelMes)]).map((a: any) => {
      const dia = dayjs(`${month}-${parseInt(a) + 1}-${year}`).isoWeekday();
      const date = dayjs(`${month}-${parseInt(a) + 1}-${year}`);

      const disp =
        dayjs(date).isSame(dayjs(`8-9-2022`)) ||
        dayjs(date).isSame(dayjs(`8-10-2022`)) ||
        dayjs(date).isSame(dayjs(`8-12-2022`)) ||
        dayjs(date).isSame(dayjs(`8-13-2022`)) ||
        dayjs(date).isSame(dayjs(`8-23-2022`)) ||
        dayjs(date).isSame(dayjs(`8-24-2022`))
          ? 0
          : 1;
      return {
        date,
        disponibilidad: disp,
        indexNumeroSemana: dia,
        numeroDia: parseInt(a) + 1,
        numeroMes: month,
        numeroAnio: year,
        seleccionado: false,
      };
    });
    return arrayDays;
  }

  changePrimerMes(valor: number) {
    if (this.primerMes + valor < 0 || this.primerMes + valor > 11) {
      return;
    }
    this.primerMes = this.primerMes + valor;
  }
}
