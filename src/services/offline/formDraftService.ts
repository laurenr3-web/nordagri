
import { IndexedDBService } from './indexedDBService';
import { v4 as uuidv4 } from 'uuid';

export interface FormDraft<T = any> {
  id: string;
  formType: string;
  formId?: string | number;
  data: T;
  lastSaved: number;
  created: number;
}

const FORM_DRAFTS_STORE = 'form_drafts';

export class FormDraftService {
  /**
   * Save a form draft
   * @param formType Type of form (e.g., 'intervention', 'time-entry')
   * @param data Form data to save
   * @param formId Optional ID if editing an existing entity
   * @returns Draft ID
   */
  static async saveDraft<T>(formType: string, data: T, formId?: string | number): Promise<string> {
    try {
      // Check if we already have a draft for this form + id combination
      let existingDraft: FormDraft<T> | null = null;
      
      if (formId) {
        const drafts = await this.getDraftsByFormId<T>(formType, formId);
        if (drafts.length > 0) {
          existingDraft = drafts[0];
        }
      }
      
      const now = Date.now();
      
      if (existingDraft) {
        // Update existing draft
        const updatedDraft: FormDraft<T> = {
          ...existingDraft,
          data,
          lastSaved: now
        };
        
        await IndexedDBService.updateInStore(FORM_DRAFTS_STORE, updatedDraft);
        return existingDraft.id;
      } else {
        // Create new draft
        const newDraft: FormDraft<T> = {
          id: uuidv4(),
          formType,
          formId,
          data,
          lastSaved: now,
          created: now
        };
        
        await IndexedDBService.addToStore(FORM_DRAFTS_STORE, newDraft);
        return newDraft.id;
      }
    } catch (error) {
      console.error('Error saving form draft:', error);
      throw error;
    }
  }
  
  /**
   * Get a specific draft by ID
   */
  static async getDraft<T>(id: string): Promise<FormDraft<T> | null> {
    try {
      return await IndexedDBService.getByKey<FormDraft<T>>(FORM_DRAFTS_STORE, id);
    } catch (error) {
      console.error('Error getting form draft:', error);
      return null;
    }
  }
  
  /**
   * Get all drafts for a specific form type
   */
  static async getDraftsByType<T>(formType: string): Promise<FormDraft<T>[]> {
    try {
      const drafts = await IndexedDBService.getByIndex<FormDraft<T>>(
        FORM_DRAFTS_STORE,
        'formType', 
        formType
      );
      
      // Sort by last saved time (newest first)
      return drafts.sort((a, b) => b.lastSaved - a.lastSaved);
    } catch (error) {
      console.error('Error getting form drafts by type:', error);
      return [];
    }
  }
  
  /**
   * Get drafts by form ID
   */
  static async getDraftsByFormId<T>(formType: string, formId: string | number): Promise<FormDraft<T>[]> {
    try {
      const allDrafts = await this.getDraftsByType<T>(formType);
      
      // Filter by form ID
      const formIdStr = formId.toString();
      return allDrafts.filter(draft => draft.formId && draft.formId.toString() === formIdStr);
    } catch (error) {
      console.error('Error getting form drafts by form ID:', error);
      return [];
    }
  }
  
  /**
   * Check if there's a draft for a specific form
   */
  static async hasDraft(formType: string, formId?: string | number): Promise<boolean> {
    try {
      if (formId) {
        const drafts = await this.getDraftsByFormId(formType, formId);
        return drafts.length > 0;
      } else {
        const drafts = await this.getDraftsByType(formType);
        return drafts.some(draft => !draft.formId);
      }
    } catch (error) {
      console.error('Error checking for form drafts:', error);
      return false;
    }
  }
  
  /**
   * Remove a draft
   */
  static async removeDraft(id: string): Promise<void> {
    try {
      await IndexedDBService.deleteFromStore(FORM_DRAFTS_STORE, id);
    } catch (error) {
      console.error('Error removing form draft:', error);
      throw error;
    }
  }
  
  /**
   * Remove all drafts for a specific form type and ID
   */
  static async removeDraftsByFormId(formType: string, formId: string | number): Promise<void> {
    try {
      const drafts = await this.getDraftsByFormId(formType, formId);
      
      // Delete each draft
      for (const draft of drafts) {
        await this.removeDraft(draft.id);
      }
    } catch (error) {
      console.error('Error removing form drafts:', error);
    }
  }
  
  /**
   * Remove all drafts older than the specified age (in milliseconds)
   */
  static async removeOldDrafts(maxAgeMs: number): Promise<number> {
    try {
      const allDrafts = await IndexedDBService.getAllFromStore<FormDraft>(FORM_DRAFTS_STORE);
      const now = Date.now();
      const oldDrafts = allDrafts.filter(draft => (now - draft.lastSaved) > maxAgeMs);
      
      for (const draft of oldDrafts) {
        await this.removeDraft(draft.id);
      }
      
      return oldDrafts.length;
    } catch (error) {
      console.error('Error removing old form drafts:', error);
      return 0;
    }
  }
}
