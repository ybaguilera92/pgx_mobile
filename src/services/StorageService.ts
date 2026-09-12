let accessionNumber = '';

export const storageService = {
  saveAccessionNumber: function (value: string) {
    accessionNumber = value || '';
    try {
      localStorage.setItem('pgx_accession_number', accessionNumber);
    } catch {
      // ignore
    }
  },

  getAccessionNumber: function (): string {
    try {
      const stored = localStorage.getItem('pgx_accession_number');
      return stored ?? accessionNumber;
    } catch {
      return accessionNumber;
    }
  },

  removeAccessionNumber: function () {
    accessionNumber = '';
    try {
      localStorage.removeItem('pgx_accession_number');
    } catch {
      // ignore
    }
  },
};
