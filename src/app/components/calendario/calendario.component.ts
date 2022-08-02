import { Component, OnInit } from '@angular/core';
import { first, Observable } from 'rxjs';
import { DatesService } from '../../services/dates.service';
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
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.css'],
})
export class CalendarioComponent implements OnInit {
  numbers: any[] = [];
  calendar: any[] = [];
  primerMes: number = 0;
  cantidadDias: number = 0;
  diaSiguiente: any | null;
  texto: string = '';
  // diasElegidos: { desde: [any | null, number[]]; hasta: [any | null, number[]] } = {
  //   desde: [null, []],
  //   hasta: [null, []],
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
      this.diasDesde = [e.desde[0], e.desde[1]];
      this.diasHasta = [e.hasta[0], e.hasta[1]];
      this.cantidadDias = e.cantidadDias;
      this.diaSiguiente = e.diaSiguiente;
      this.setNightText();
    });
  }

  setNightText() {
    if (this.cantidadDias == 1) {
      this.texto = 'noche';
    } else {
      this.texto = 'noches';
    }
  }

  selectDay(dia: dia, indexMes: number, indexDia: number) {
    indexMes = indexMes + this.primerMes;
    const indexMesDia = [indexMes, indexDia];
    if (dia.disponibilidad == false) {
      return;
    }
    if (this.diasDesde[0] == null) {
      dia.seleccionado = true;
      this.diasDesde = [dayjs(dia.date), indexMesDia];
      this.diasHasta = [dayjs(dia.date), indexMesDia];
      this.datesService.setDias({
        desde: this.diasDesde,
        hasta: this.diasHasta,
      });
      return;
    }

    //si la fecha es la misma que la final, que la fecha sea la de inicio
    if (
      dayjs(dia.date).isSame(dayjs(this.diasHasta[0])) &&
      !dayjs(this.diasDesde[0]).isSame(dayjs(this.diasHasta[0]))
    ) {
      this.cleanCalendar();
      dia.seleccionado = true;
      this.diasDesde = [dayjs(dia.date), indexMesDia];
      this.diasHasta = [dayjs(dia.date), indexMesDia];
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
      this.diasHasta = [dayjs(dia.date), indexMesDia];
      this.datesService.setDias({
        desde: this.diasDesde,
        hasta: this.diasHasta,
      });
      return;
    }

    //si la fecha es igual a la de inicio, que se limpien los dias elegidos
    if (dayjs(dia.date).isSame(dayjs(this.diasDesde[0]))) {
      this.cleanCalendar();
      if (!dayjs(dia.date).isSame(dayjs(this.diasHasta[0]))) {
        dia.seleccionado = true;
        this.diasDesde = [dayjs(dia.date), indexMesDia];
        this.diasHasta = [dayjs(dia.date), indexMesDia];
        this.datesService.setDias({
          desde: this.diasDesde,
          hasta: this.diasHasta,
        });
      } else {
        this.diasDesde = [null, []];
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
        if (this.checkCalendarGapAvailability(this.diasHasta[1], indexMesDia)) {
          this.diasHasta = [dayjs(dia.date), indexMesDia];
          this.datesService.setDias({
            desde: this.diasDesde,
            hasta: this.diasHasta,
          });
          this.paintCalendarGap(this.diasDesde[1], indexMesDia);
        } else {
          this.showErrorSnackBar(
            'Hay días no disponibles entre ese rango de fechas'
          );
        }

        //si la fecha es menor a la de fin, la fecha es el nuevo fin
      } else if (dayjs(dia.date).isBefore(this.diasHasta[0])) {
        this.cleanCalendar();
        this.diasHasta = [dayjs(dia.date), indexMesDia];
        this.datesService.setDias({
          desde: this.diasDesde,
          hasta: this.diasHasta,
        });
        this.paintCalendarGap(this.diasDesde[1], this.diasHasta[1]);
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
  checkCalendarGapAvailability(indexInicio: number[], indexFin: number[]) {
    let redFlag = false;
    outer_loop: for (let i = indexInicio[0]; i <= indexFin[0]; i++) {
      if (i == indexInicio[0] && i != indexFin[0]) {
        //console.log('el mes es igual al de inicio ');
        for (let j = indexInicio[1]; j < this.calendar[i].length; j++) {
          if (this.calendar[i][j].disponibilidad == false) {
            redFlag = true;
            break outer_loop;
          }
        }
      } else if (i == indexInicio[0] && i == indexFin[0]) {
        //console.log('el mes es igual al de inicio y igual al de fin');
        for (let j = indexInicio[1]; j <= indexFin[1]; j++) {
          if (this.calendar[i][j].disponibilidad == false) {
            redFlag = true;
            break outer_loop;
          }
        }
      } else if (i == indexFin[0]) {
        //console.log('el mes es igual al de fin');
        for (let j = 0; j <= indexFin[1]; j++) {
          if (this.calendar[i][j].disponibilidad == false) {
            redFlag = true;
            break outer_loop;
          }
        }
      }

      if (i != indexInicio[0] && i != indexFin[0]) {
        //console.log('el mes esta en el medio');
        for (let j = 0; j < this.calendar[i].length; j++) {
          if (this.calendar[i][j].disponibilidad == false) {
            redFlag = true;
            break outer_loop;
          }
        }
      }
    }

    if (redFlag) {
      return false;
    }
    return true;
  }
  paintCalendarGap(indexInicio: number[], indexFin: number[]) {
    outer_loop: for (let i = indexInicio[0]; i <= indexFin[0]; i++) {
      if (i == indexInicio[0] && i != indexFin[0]) {
        //console.log('el mes es igual al de inicio ');
        for (let j = indexInicio[1]; j < this.calendar[i].length; j++) {
          if (this.calendar[i][j].disponibilidad == true) {
            this.calendar[i][j].seleccionado = true;
          } else {
            break outer_loop;
          }
        }
      } else if (i == indexInicio[0] && i == indexFin[0]) {
        //console.log('el mes es igual al de inicio y igual al de fin');
        for (let j = indexInicio[1]; j <= indexFin[1]; j++) {
          if (this.calendar[i][j].disponibilidad == true) {
            this.calendar[i][j].seleccionado = true;
          } else {
            break outer_loop;
          }
        }
      } else if (i == indexFin[0]) {
        //console.log('el mes es igual al de fin');
        for (let j = 0; j <= indexFin[1]; j++) {
          if (this.calendar[i][j].disponibilidad == true) {
            this.calendar[i][j].seleccionado = true;
          } else {
            break outer_loop;
          }
        }
      }

      if (i != indexInicio[0] && i != indexFin[0]) {
        //console.log('el mes esta en el medio');
        for (let j = 0; j < this.calendar[i].length; j++) {
          if (this.calendar[i][j].disponibilidad == true) {
            this.calendar[i][j].seleccionado = true;
          } else {
            break outer_loop;
          }
        }
      }
    }
  }

  showErrorSnackBar(text: string) {
    let action = '';
    let config: MatSnackBarConfig = {
      duration: 2000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['alerta'],
    };
    this._snackBar.open(text, action, config);
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
    // var start = window.performance.now();
    // var end = window.performance.now();
    // console.log(`Execution time: ${end - start} ms`);
  }

  disableAvailabilityofFirstMonth() {
    this.calendar[0].forEach((e: dia) => {
      if (e.numeroDia < dayjs().date()) {
        e.disponibilidad = false;
      }
    });
  }

  getMonthInfo(month: number, year: number) {
    //console.log(dayjs(`1/${month}/${year}`));
    const diaFinalDelMes = dayjs(`${month}/01/${year}`).daysInMonth();
    let diasOcupados: string[] = [];
    this.datesService.diasOcupados$.pipe(first()).subscribe((e) => {
      diasOcupados = e;
    });

    const arrayDays = Object.keys([...Array(diaFinalDelMes)]).map((a: any) => {
      const dia = dayjs(`${month}/${parseInt(a) + 1}/${year}`).isoWeekday();
      const date = dayjs(`${month}/${parseInt(a) + 1}/${year}`);

      let disp = 1;
      for (let i = diasOcupados.length - 1; i >= 0; i--) {
        if (dayjs(date).isSame(dayjs(diasOcupados[i]))) {
          disp = 0;
          diasOcupados.splice(i, 1);
        }
      }

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

  cambiarPrimerMes(valor: number) {
    if (this.primerMes + valor < 0 || this.primerMes + valor > 11) {
      return;
    }
    this.primerMes = this.primerMes + valor;
  }

  borrarFechas() {
    this.cleanCalendar();
    this.datesService.removeDias();
  }
}
