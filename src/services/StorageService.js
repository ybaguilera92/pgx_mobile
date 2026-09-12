let accessionNumber = '';

export const storageService = {
  saveAccessionNumber: function (value) {
    accessionNumber = value;
  },

  getAccessionNumber: function () {
    return accessionNumber;
  },

  removeAccessionNumber: function () {
    accessionNumber = '';
  },
};
