import { Enquiry, AIExtractionResult, PipelineStatus } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    return { status: 'offline', error: String(err) };
  }
}

export async function fetchEnquiries(params?: {
  status?: string;
  category?: string;
  search?: string;
}): Promise<Enquiry[]> {
  const url = new URL(`${API_BASE_URL}/api/enquiries`);
  if (params?.status) url.searchParams.append('status', params.status);
  if (params?.category) url.searchParams.append('category', params.category);
  if (params?.search) url.searchParams.append('search', params.search);

  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch enquiries');
  return res.json();
}

export async function updateEnquiry(
  id: number,
  data: Partial<Enquiry>
): Promise<Enquiry> {
  const res = await fetch(`${API_BASE_URL}/api/enquiries/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update enquiry ${id}`);
  return res.json();
}

export async function createEnquiry(data: Partial<Enquiry>): Promise<Enquiry> {
  const res = await fetch(`${API_BASE_URL}/api/enquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create enquiry');
  return res.json();
}

export async function deleteEnquiry(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/enquiries/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete enquiry ${id}`);
}

export async function parseMessageWithAI(
  raw_text: string,
  channel: string = 'WhatsApp'
): Promise<AIExtractionResult> {
  const res = await fetch(`${API_BASE_URL}/api/ai/parse-message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw_text, channel }),
  });
  if (!res.ok) throw new Error('Failed to parse message with AI');
  return res.json();
}

export async function batchEnrichEnquiries(force = false) {
  const res = await fetch(`${API_BASE_URL}/api/ai/batch-enrich?force=${force}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to batch enrich');
  return res.json();
}

export async function fetchWeeklySummary(): Promise<{ summary: string; total_leads: number }> {
  const res = await fetch(`${API_BASE_URL}/api/ai/weekly-summary`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to generate summary');
  return res.json();
}

export async function seedSampleData() {
  const res = await fetch(`${API_BASE_URL}/api/enquiries/seed-sample`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to seed sample data');
  return res.json();
}

export async function resetSampleData() {
  const res = await fetch(`${API_BASE_URL}/api/enquiries/reset-data`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to reset sample data');
  return res.json();
}
