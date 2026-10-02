const PROXIED_URL = '/api/v1/diagnostic-project/patient-report';
const DIRECT_URL = 'https://pgxstandalone30163.pgxsoftware.com/api/v1/diagnostic-project/patient-report';

export interface ReportFormValues {
  AccesionNumber: string;
  Key: string;
}

function buildPatientReportBody(formValues: ReportFormValues): string {
  const key = String(formValues.Key ?? '').trim();
  const accesionNumber = String(formValues.AccesionNumber ?? '').trim();
  return JSON.stringify({ key, accesionNumber });
}

export const reportService = {
  getReportUrl: async function (formValues: ReportFormValues): Promise<string> {
    const body = buildPatientReportBody(formValues);

    let lastError: Error | null = null;

    // Try proxied endpoint first to avoid CORS issues in web dev
    try {
      const response = await fetch(PROXIED_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: body,
      });

      if (response.ok) {
        const textResponse = await response.text();
        return textResponse.replace(/^"|"$/g, '').trim();
      } else {
        const errText = await response.text().catch(() => '');
        throw new Error(errText || `Server returned ${response.status}: ${response.statusText}`);
      }
    } catch (err: any) {
      lastError = err;
      console.warn('Proxied request failed, attempting direct fetch:', err.message);
    }

    // Try direct fetch as fallback
    try {
      const response = await fetch(DIRECT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: body,
      });

      if (response.ok) {
        const textResponse = await response.text();
        return textResponse.replace(/^"|"$/g, '').trim();
      } else {
        const errText = await response.text().catch(() => '');
        throw new Error(errText || `Direct server response error: ${response.status}`);
      }
    } catch (err: any) {
      console.warn('Direct fetch also failed:', err.message);
      // If network failed (e.g. backend server is down or CORS blocked), throw descriptive error
      throw new Error(
        lastError?.message || err?.message || 'Unable to connect to PGx report server. Please check your network and credentials.'
      );
    }
  },
};
