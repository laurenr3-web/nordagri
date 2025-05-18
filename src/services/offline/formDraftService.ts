
/**
 * Service to handle form draft persistence and recovery
 */
import { v4 as uuidv4 } from 'uuid';
import { IndexedDBService } from './indexedDBService';
import { toast } from 'sonner';

export interface FormDraft<T = any> {
  id: string;
  formType: string;
  data: T;
  lastSaved: number;
  formId?: string | number; // For editing existing items
  user?: string; // For multi-user environments
  metadata?: Record<string, any>; // Additional information
}

const DRAFTS_STORE = 'form_drafts';
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

export class FormDraftService {
  /**
   * Save a form draft
   * @param formType Identifier for the form type (e.g., 'intervention', 'observation')
   * @param data Form data to save
   * @param formId Optional ID if editing an existing item
   * @param metadata Additional metadata
   * @returns Promise with the draft ID
   */
  static async saveDraft<T>(
    formType: string,
    data: T,
    formId?: string | number,
    metadata?: Record<string, any>
  ): Promise<string> {
    try {
      // Check if we're updating an existing draft
      let draftId: string;
      const existingDrafts = await this.getDraftsByType(formType);
      const existingDraft = existingDrafts.find(
        (draft) => draft.formId === formId
      );

      if (existingDraft) {
        draftId = existingDraft.id;
        await IndexedDBService.updateInStore(DRAFTS_STORE, {
          ...existingDraft,
          data,
          lastSaved: Date.now(),
          metadata: { ...existingDraft.metadata, ...metadata }
        });
      } else {
        // Create a new draft
        draftId = uuidv4();
        const draft: FormDraft<T> = {
          id: draftId,
          formType,
          data,
          formId,
          lastSaved: Date.now(),
          metadata
        };
        await IndexedDBService.addToStore(DRAFTS_STORE, draft);
      }

      return draftId;
    } catch (error) {
      console.error('Error saving form draft:', error);
      throw error;
    }
  }

  /**
   * Get a specific draft by ID
   * @param draftId Draft ID to retrieve
   * @returns Promise with the draft or null
   */
  static async getDraft<T>(draftId: string): Promise<FormDraft<T> | null> {
    try {
      return await IndexedDBService.getByKey<FormDraft<T>>(DRAFTS_STORE, draftId);
    } catch (error) {
      console.error('Error retrieving form draft:', error);
      return null;
    }
  }

  /**
   * Get all drafts for a specific form type
   * @param formType Form type to filter by
   * @returns Promise with an array of drafts
   */
  static async getDraftsByType<T>(formType: string): Promise<FormDraft<T>[]> {
    try {
      const allDrafts = await IndexedDBService.getAllFromStore<FormDraft<T>>(DRAFTS_STORE);
      return allDrafts.filter(draft => draft.formType === formType);
    } catch (error) {
      console.error('Error retrieving form drafts by type:', error);
      return [];
    }
  }

  /**
   * Remove a draft by ID
   * @param draftId Draft ID to remove
   * @returns Promise<void>
   */
  static async removeDraft(draftId: string): Promise<void> {
    try {
      await IndexedDBService.deleteFromStore(DRAFTS_STORE, draftId);
    } catch (error) {
      console.error('Error removing form draft:', error);
      throw error;
    }
  }

  /**
   * Remove all drafts for a specific form type
   * @param formType Form type to remove
   * @returns Promise<void>
   */
  static async removeDraftsByType(formType: string): Promise<void> {
    try {
      const drafts = await this.getDraftsByType(formType);
      for (const draft of drafts) {
        await this.removeDraft(draft.id);
      }
    } catch (error) {
      console.error('Error removing form drafts by type:', error);
      throw error;
    }
  }

  /**
   * Clear drafts older than a specific age
   * @param maxAgeMs Maximum age in milliseconds to keep
   * @returns Promise<number> Number of drafts cleared
   */
  static async clearOldDrafts(maxAgeMs: number): Promise<number> {
    try {
      const now = Date.now();
      const allDrafts = await IndexedDBService.getAllFromStore<FormDraft>(DRAFTS_STORE);
      let removedCount = 0;

      for (const draft of allDrafts) {
        if (now - draft.lastSaved > maxAgeMs) {
          await this.removeDraft(draft.id);
          removedCount++;
        }
      }

      return removedCount;
    } catch (error) {
      console.error('Error clearing old form drafts:', error);
      return 0;
    }
  }
}
