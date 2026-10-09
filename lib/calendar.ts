import * as Calendar from 'expo-calendar/legacy';
import { Platform } from 'react-native';

export async function addEventToCalendar(title: string, startDate: Date, endDate: Date, location: string, notes: string) {
  if (Platform.OS === 'web') {
    try {
      // Formata as datas para o formato que o Google Calendar exige (YYYYMMDDTHHmmssZ) em UTC
      const formatToGoogleDate = (date: Date) => {
        return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
      };

      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatToGoogleDate(startDate)}/${formatToGoogleDate(endDate)}&details=${encodeURIComponent(notes)}&location=${encodeURIComponent(location)}`;
      
      // Abre a aba do Google Calendar
      window.open(googleCalendarUrl, '_blank');
      return true;
    } catch (e) {
      console.log('Erro ao abrir Google Calendar na web', e);
      return false;
    }
  }

  try {
    // 1. Solicita permissão
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permissão de calendário negada.');
      return false;
    }

    let calendarId = null;

    // 2. Encontra o calendário correto para o SO
    if (Platform.OS === 'ios') {
      try {
        const defaultCalendar = await Calendar.getDefaultCalendarAsync();
        calendarId = defaultCalendar.id;
      } catch (e) {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        calendarId = calendars[0]?.id;
      }
    } else {
      // Android
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      // Tenta achar o calendário primário (geralmente a conta principal do Google)
      const primaryCalendar = calendars.find(cal => cal.isPrimary) || 
                              calendars.find(cal => cal.accessLevel === Calendar.CalendarAccessLevel.OWNER) ||
                              calendars[0];
                              
      if (primaryCalendar) {
        calendarId = primaryCalendar.id;
      }
    }

    if (!calendarId) {
      console.log('Nenhum calendário encontrado.');
      return false;
    }

    // 3. Cria o evento de forma silenciosa
    await Calendar.createEventAsync(calendarId, {
      title,
      startDate,
      endDate,
      location,
      notes,
      alarms: [
        { relativeOffset: -60 }, // Alerta 1 hora antes
        { relativeOffset: -1440 } // Alerta 1 dia antes
      ]
    });

    console.log('Consulta adicionada ao calendário com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao adicionar evento ao calendário:', error);
    return false;
  }
}
