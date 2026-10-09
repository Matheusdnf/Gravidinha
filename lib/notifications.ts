export async function registerForPushNotificationsAsync() {
  console.log("Notificações desativadas temporariamente para compatibilidade com o Expo Go.");
  return null;
}

export async function scheduleLocalNotification(title: string, _body: string, _triggerDate: Date) {
  console.log(`Notificação local mockada: ${title}`);
  return "dummy-id";
}
