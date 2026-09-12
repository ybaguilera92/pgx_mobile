import PushNotification from 'react-native-push-notification';

const channelId = 'download';
const notificationId = 'downloadPfd';

// Crear el canal de notificaciones (requerido para Android)
PushNotification.createChannel(
  {
    channelId: channelId,
    channelName: 'Default Channel',
    channelDescription: 'Canal para notificaciones de descarga',
    playSound: false,
    soundName: 'default',
    importance: 4,
    vibrate: true,
  },
  (created) => console.log(`Canal de notificaciones creado: ${created}`)
);

export const notificationService = {
  onDisplayNotification: function () {
    PushNotification.localNotification({
      channelId: channelId,
      id: notificationId,
      title: 'Preparing to download',
      message: 'Iniciando descarga...',
      progress: 0,
      onlyAlertOnce: true,
      smallIcon: 'ic_nownload_not',
      ongoing: true,
      autoCancel: false,
    });
  },

  onUpdateNotification: function (progress, path) {
    if (progress > 0 && progress !== 101) {
      PushNotification.localNotification({
        channelId: channelId,
        id: notificationId,
        title: 'Downloading report',
        message: `${progress}%`,
        progress: progress,
        onlyAlertOnce: true,
        smallIcon: 'ic_nownload_not',
        ongoing: true,
        autoCancel: false,
      });
    } else if (progress === 101) {
      PushNotification.localNotification({
        channelId: channelId,
        id: notificationId,
        title: 'Downloaded successfully!',
        message: `Path: ${path}`,
        onlyAlertOnce: true,
        smallIcon: 'ic_complete',
        ongoing: false,
        autoCancel: true,
      });
    } else {
      PushNotification.cancelLocalNotification({id: notificationId});
    }
  },

  cancelNotification: function () {
    PushNotification.cancelLocalNotification({id: notificationId});
  },
};
