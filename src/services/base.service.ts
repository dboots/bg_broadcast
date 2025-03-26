import { getSupabaseClient } from '@/lib/supabase';

export class SupabaseService<T> {
  private tableName: string;
  private supabase = getSupabaseClient();

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async getAll(): Promise<T[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*');

    if (error) {
      console.error('Error fetching data:', error);
      throw error;
    }

    return data as T[];
  }

  async getByFieldValue(field: string, value: string): Promise<T | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq(field, value)
      .single();

    if (error) {
      console.error(
        `Error fetching ${this.tableName} with ${field} ${value}:`,
        error
      );
      throw error;
    }

    return data as T;
  }

  async create(item: Omit<T, 'id'>): Promise<T> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert(item)
      .select()
      .single();

    if (error) {
      console.error(`Error creating ${this.tableName}:`, error);
      throw error;
    }

    return data as T;
  }

  async update(id: string, item: Partial<T>): Promise<T> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .update(item)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating ${this.tableName} with id ${id}:`, error);
      throw error;
    }

    return data as T;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from(this.tableName).delete().eq('id', id);

    if (error) {
      console.error(`Error deleting ${this.tableName} with id ${id}:`, error);
      throw error;
    }
  }
}
