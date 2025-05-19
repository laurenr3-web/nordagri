
import { IndexedDBService } from './indexedDBService';

export interface FormDraft<T> {
  id: string;
  data: T;
  createdAt: number;
  updatedAt: number;
  formType: string;
  meta?: Record<string, any>;
}

export class FormDraftService {
  // Store a draft form to IndexedDB
  static async saveDraft<T>(formType: string, data: T, meta?: Record<string, any>): Promise<string> {
    const id = crypto.randomUUID();
    const timestamp = Date.now();
    
    const draft: FormDraft<T> = {
      id,
      data,
      formType,
      createdAt: timestamp,
      updatedAt: timestamp,
      meta
    };
    
    await IndexedDBService.addToStore('formDrafts', draft);
    return id;
  }
  
  // Update an existing draft
  static async updateDraft<T>(id: string, data: T, meta?: Record<string, any>): Promise<void> {
    const existingDraft = await this.getDraft<T>(id);
    
    if (!existingDraft) {
      throw new Error(`Draft with ID ${id} not found`);
    }
    
    const updatedDraft: FormDraft<T> = {
      ...existingDraft,
      data,
      updatedAt: Date.now(),
      meta: meta !== undefined ? meta : existingDraft.meta
    };
    
    await IndexedDBService.updateInStore('formDrafts', updatedDraft);
  }
  
  // Get a specific draft by ID
  static async getDraft<T>(id: string): Promise<FormDraft<T> | null> {
    try {
      const draft = await IndexedDBService.getByKey('formDrafts', id) as FormDraft<T> | undefined;
      return draft || null;
    } catch (error) {
      console.error('Error retrieving draft:', error);
      return null;
    }
  }
  
  // Delete a draft by ID
  static async deleteDraft(id: string): Promise<void> {
    await IndexedDBService.deleteFromStore('formDrafts', id);
  }
  
  // Get all drafts for a specific form type
  static async getDrafts<T>(formType: string): Promise<FormDraft<T>[]> {
    try {
      const allDrafts = await IndexedDBService.getAllFromStore<FormDraft<T>>('formDrafts');
      
      // Filter by form type
      const typeDrafts = allDrafts.filter(draft => draft.formType === formType);
      
      // Sort by updatedAt (newest first)
      return typeDrafts.sort((a, b) => b.updatedAt - a.updatedAt);
    } catch (error) {
      console.error('Error retrieving drafts:', error);
      return [];
    }
  }
  
  // Get the most recent draft for a specific form type
  static async getRecentDraft<T>(formType: string): Promise<FormDraft<T> | null> {
    const drafts = await this.getDrafts<T>(formType);
    
    if (drafts && drafts.length > 0) {
      // Sort drafts by updatedAt date (most recent first)
      const sortedDrafts = [...drafts].sort((a, b) => b.updatedAt - a.updatedAt);
      return sortedDrafts[0];
    }
    
    return null;
  }
}
