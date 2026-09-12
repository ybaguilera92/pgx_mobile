const PATIENT_REPORT_URL =
  'https://pgxstandalone30163.pgxsoftware.com/api/v1/diagnostic-project/patient-report';

function buildPatientReportBody(formValues) {
  const key = String(formValues.Key ?? '').trim();
  const accesionNumber = String(formValues.AccesionNumber ?? '').trim();
  return JSON.stringify({key, accesionNumber});
}

export const reportService = {
  getReportUrl: async function (formValues) {
    const body = buildPatientReportBody(formValues);

    try {
      const response = await fetch(PATIENT_REPORT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: body,
      });
      if (response.ok) {
        const textResponse = await response.text();
        return textResponse.replace(/^"|"$/g, '');
      } else {
        throw new Error('Network response was not ok!');
      }
    } catch (error) {
      throw error;
    }
  },
};
