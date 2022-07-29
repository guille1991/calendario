import { first, Observable } from 'rxjs';
import { DatesService } from './services/dates.service';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import * as dayjs from 'dayjs';
import * as isoWeek from 'dayjs/plugin/isoWeek';
import 'dayjs/locale/es';
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
  texto: string = '';
  diasElegidos: { desde: any | null; hasta: any | null } = {
    desde: null,
    hasta: null,
  };
  diasDesde: any | null;
  diasHasta: any | null;

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

  constructor(private datesService: DatesService) {}

  ngOnInit(): void {
    this.diasElegidos$ = this.datesService.diasElegidos$;
    this.getFullCalendar();
    this.disableAvailabilityofFirstMonth();

    this.datesService.diasElegidos$.pipe().subscribe((e) => {
      e.desde != null
        ? (this.diasDesde = dayjs(e.desde))
        : (this.diasDesde = null);
      e.hasta != null
        ? (this.diasHasta = dayjs(e.hasta))
        : (this.diasHasta = null);

      if (e.desde != null && e.hasta == null) {
        this.cantidadDias = 1;
        this.texto = 'día';
      } else if (e.desde != null && e.hasta != null) {
        this.cantidadDias =
          dayjs(this.diasHasta).diff(dayjs(this.diasDesde), 'day') + 1;
        this.texto = 'días';
      } else {
        this.cantidadDias = 0;
      }
    });
  }

  selectDay(dia: dia, indexMes: number, indexDia: number) {
    if (dia.disponibilidad == false) {
      return;
    }
    if (this.diasElegidos.desde == null) {
      dia.seleccionado = true;
      this.diasElegidos.desde = dayjs(dia.date);
      this.datesService.setDias(this.diasElegidos);
      return;
    }

    //si la fecha es la misma que la final, que la fecha sea la de inicio
    if (dayjs(dia.date).isSame(dayjs(this.diasElegidos.hasta))) {
      this.cleanCalendar();
      dia.seleccionado = true;
      this.diasElegidos.desde = dayjs(dia.date);
      this.diasElegidos.hasta = null;
      this.datesService.setDias(this.diasElegidos);
      return;
    }

    //si la fecha es anterior a la de inicio, la fecha es ahora la de inicio
    if (dayjs(dia.date).isBefore(dayjs(this.diasElegidos.desde))) {
      this.cleanCalendar();
      dia.seleccionado = true;
      this.diasElegidos.desde = dayjs(dia.date);
      this.diasElegidos.hasta = null;
      this.datesService.setDias(this.diasElegidos);
      return;
    }

    //si la fecha es igual a la de inicio, que se limpien los dias elegidos
    if (dayjs(dia.date).isSame(dayjs(this.diasElegidos.desde))) {
      this.cleanCalendar();
      if (this.diasElegidos.hasta == null) {
        this.diasElegidos.desde = null;
        this.datesService.setDias(this.diasElegidos);
      } else {
        dia.seleccionado = true;
        this.diasElegidos.desde = dayjs(dia.date);
        this.diasElegidos.hasta = null;
        this.datesService.setDias(this.diasElegidos);
      }
      return;
    }

    if (dayjs(dia.date).isAfter(this.diasElegidos.desde)) {
      //si la fecha es mayor a la de inicio
      //y es menor que la de fin o si la de fin no existe
      if (this.diasElegidos.hasta === null) {
        this.diasElegidos.hasta = dayjs(dia.date);
        this.datesService.setDias(this.diasElegidos);
        this.paintCalendarGap(indexMes, indexDia);

        return;
      }
      //si la fecha es mayor que la de fin, la fecha es el nuevo fin
      if (dayjs(dia.date).isAfter(this.diasElegidos.hasta)) {
        this.diasElegidos.hasta = dayjs(dia.date);
        this.datesService.setDias(this.diasElegidos);
        this.paintCalendarGap(indexMes, indexDia);
        //si la fecha es menor a la de fin, la fecha es el nuevo fin
      } else if (dayjs(dia.date).isBefore(this.diasElegidos.hasta)) {
        this.cleanCalendar();
        this.diasElegidos.hasta = dayjs(dia.date);
        this.datesService.setDias(this.diasElegidos);
        this.paintCalendarGap(indexMes, indexDia);
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

  paintCalendarGap(indexMes: number, indexDia: number) {
    outer_loop: for (let i = indexMes; i >= 0; i--) {
      for (let j = indexDia; j >= 0; j--) {
        if (this.calendar[i][j].disponible === false) {
        }
        this.calendar[i][j].seleccionado = true;
        if (
          dayjs(this.calendar[i][j].date).isSame(dayjs(this.diasElegidos.desde))
        ) {
          break outer_loop;
        }
      }
      indexDia = this.calendar[i - 1].length - 1;
    }
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
        dayjs(date).isSame(dayjs(`8-10-2022`)) ||
        dayjs(date).isSame(dayjs(`8-12-2022`)) ||
        dayjs(date).isSame(dayjs(`8-13-2022`)) ||
        dayjs(date).isSame(dayjs(`8-23-2022`)) ||
        dayjs(date).isSame(dayjs(`8-24-2022`)) ||
        dayjs(date).isSame(dayjs(`9-1-2022`)) ||
        dayjs(date).isSame(dayjs(`9-2-2022`)) ||
        dayjs(date).isSame(dayjs(`9-3-2022`))
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
    console.log(this.primerMes);
  }
}
