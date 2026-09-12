export const checkIsJsonService = {
  isJson: function (data: any): boolean {
    if (typeof data !== 'string') {
      return typeof data === 'object' && data !== null;
    }
    try {
      JSON.parse(data);
      return true;
    } catch {
      return false;
    }
  },
};
