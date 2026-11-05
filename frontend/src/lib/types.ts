export type PipelineStatus = 'New' | 'Contacted' | 'Interested' | 'Paid' | 'Lost';

export type LeadCategory = 
  | 'Bootcamp'
  | 'Fellowship'
  | 'Corporate Training'
  | 'Refund / Support'
  | 'Job Application'
  | 'Spam'
  | 'General Inquiry';

export interface Enquiry {
  id: number;
  original_id?: number | null;
  channel: string;
  received_at?: string | null;
  sender_name: string;
  phone?: string | null;
  raw_message: string;
  category: string;
  detected_language: string;
  suggested_reply?: string | null;
  priority: string;
  status: PipelineStatus;
  notes?: string | null;
  last_contacted_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AIExtractionResult {
  sender_name: string;
  phone: string | null;
  category: string;
  detected_language: string;
  priority: string;
  suggested_reply: string;
  reasoning?: string;
}
