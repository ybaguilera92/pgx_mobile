import Toast from 'react-native-toast-message';

export const messageService = {
  successMessage: function (text2) {
    Toast.show({
      type: 'success',
      text1: 'Report download successfully',
      text2: text2,
      position: 'bottom',
      bottomOffset: 60,
      visibilityTime: 5000,
    });
  },
  errorMessage: function (err, text1) {
    Toast.show({
      type: 'error',
      text1: text1,
      text2: err,
      position: 'bottom',
      bottomOffset: 60,
    });
  },
};
