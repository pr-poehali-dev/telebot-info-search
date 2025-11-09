const API_BASE_URL = 'https://functions.poehali.dev/9e153d8a-a027-436c-befe-cdaa25ef6f03';

export interface Statistics {
  totalUsers: number;
  totalSearches: number;
  databaseRecords: number;
  activeToday: number;
}

export interface AdditionalInfo {
  label: string;
  value: string;
}

export interface PhoneRecord {
  id: number;
  phone: string;
  name: string;
  info: string;
  additional_info: AdditionalInfo[];
  status: string;
  created_at: string;
}

export interface BotUser {
  id: number;
  telegram_id: number;
  username: string;
  first_name: string;
  last_name: string;
  search_count: number;
  status: string;
  joined: string;
  last_active: string;
}

export const api = {
  async getStatistics(): Promise<Statistics> {
    const response = await fetch(`${API_BASE_URL}?path=statistics`);
    if (!response.ok) throw new Error('Failed to fetch statistics');
    return response.json();
  },

  async getPhoneRecords(search: string = ''): Promise<PhoneRecord[]> {
    const url = search 
      ? `${API_BASE_URL}?path=phone-records&search=${encodeURIComponent(search)}`
      : `${API_BASE_URL}?path=phone-records`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch phone records');
    return response.json();
  },

  async getBotUsers(search: string = ''): Promise<BotUser[]> {
    const url = search
      ? `${API_BASE_URL}?path=users&search=${encodeURIComponent(search)}`
      : `${API_BASE_URL}?path=users`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  async addPhoneRecord(phone: string, name: string, info: string, additional_info: AdditionalInfo[] = []): Promise<PhoneRecord> {
    const response = await fetch(`${API_BASE_URL}?path=phone-records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, name, info, additional_info })
    });
    if (!response.ok) throw new Error('Failed to add phone record');
    return response.json();
  },

  async updatePhoneRecord(id: number, phone: string, name: string, info: string, status: string, additional_info: AdditionalInfo[] = []): Promise<PhoneRecord> {
    const response = await fetch(`${API_BASE_URL}?path=phone-records`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, phone, name, info, status, additional_info })
    });
    if (!response.ok) throw new Error('Failed to update phone record');
    return response.json();
  },

  async deletePhoneRecord(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}?path=phone-records&id=${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Failed to delete phone record');
  },

  async updateUserStatus(id: number, status: string): Promise<BotUser> {
    const response = await fetch(`${API_BASE_URL}?path=users`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });
    if (!response.ok) throw new Error('Failed to update user status');
    return response.json();
  }
};