export const checkIsJsonService = {
  isJson: function (data) {
    var ret = true;
    try {
      JSON.parse(data);
    } catch (e) {
      ret = false;
    }
    return ret;
  },
};
