import React, { useState, useMemo, useEffect } from 'react';
import { format, subDays, addDays, setHours, setMinutes, setSeconds, isBefore, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';
import { utcToZonedTime } from 'date-fns-tz';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

import api from '~/services/api';

import { Container, Time } from './styles';

const range = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

export default function Dashboard() {
  const [date, setDate] = useState(new Date());
  const [schedule, setSchedule] = useState([]);

  const dateFormatted = useMemo(() => format(date, "dd 'de' MMMM", { locale: pt }), [date]);

  useEffect(() => {
    async function loadSchedule() {
      const response = await api.get('schedule', {
        params: { date },
      });
      // 2020-07-01T19:00:00.000Z
      const timezone = Intl.DateTimeFormat('pt-BR').resolvedOptions().timeZone;

      const data = range.map(hour => {
        const checkDate = setSeconds(setMinutes(setHours(date, hour), 0), 0);
        const compareDate = utcToZonedTime(checkDate, timezone);
        console.tron.error(checkDate);
        return {
          time: `${hour}h00`,
          past: isBefore(compareDate, new Date()),
          appointment: response.data.find(a => parseISO(a.date).toString() === compareDate.toString()),
        };
      });
      console.tron.error(data);

      setSchedule(data);
    }
    loadSchedule();
  }, [date]);

  function handlePrevDay() {
    setDate(subDays(date, 1));
  }

  function handleNextDay() {
    setDate(addDays(date, 1));
  }

  return (
    <Container>
      <header>
        <button type="button" onClick={handlePrevDay}>
          <MdChevronLeft size={36} color="#fff" />
        </button>
        <strong>{dateFormatted}</strong>
        <button type="button" onClick={handleNextDay}>
          <MdChevronRight size={36} color="#fff" />
        </button>
      </header>

      <ul>
        {schedule.map(time => (
          <Time key={time.time} past={time.past} available={!time.appointment}>
            <strong>{time.time}</strong>
            <span>{time.appointment ? time.appointment.user.name : 'Em aberto'}</span>
          </Time>
        ))}
      </ul>
    </Container>
  );
}
