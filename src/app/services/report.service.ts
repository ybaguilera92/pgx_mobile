import { Injectable } from '@angular/core';
import { ReportFormValues } from '../models/report.model';

const PROXIED_URL = '/api/v1/diagnostic-project/patient-report';
const DIRECT_URL = 'https://pgxstandalone30163.pgxsoftware.com/api/v1/diagnostic-project/patient-report';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  async getReportUrl(formValues: ReportFormValues): Promise<string> {
    const key = String(formValues.Key ?? '').trim();
    const accesionNumber = String(formValues.AccesionNumber ?? '').trim();
    const body = JSON.stringify({ key, accesionNumber });

    let lastError: Error | null = null;

    // 1. Try proxied endpoint first to avoid CORS issues in dev environment
    try {
      const response = await fetch(PROXIED_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body,
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

    // 2. Try direct fetch as fallback
    try {
      const response = await fetch(DIRECT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body,
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
      throw new Error(
        lastError?.message || err?.message || 'Unable to connect to PGx report server. Please check your network and credentials.'
      );
    }
  }
}
