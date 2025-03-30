
/**
 * Utility functions for safe DOM operations
 */

/**
 * Safely removes a child node from its parent
 * 
 * @param parent The parent node
 * @param child The child node to remove
 * @returns boolean indicating success
 */
export function safeRemoveChild(parent: Node, child: Node): boolean {
  // Check if the child actually exists and is a child of the parent
  if (!parent || !child) return false;
  
  try {
    // Check if the child is actually a child of this parent
    if (parent.contains(child)) {
      parent.removeChild(child);
      return true;
    } else if (child.parentNode) {
      // If it has a parent, but not the one we expected, remove from actual parent
      child.parentNode.removeChild(child);
      return true;
    }
  } catch (error) {
    console.warn('Safe DOM removal error:', error);
  }
  
  return false;
}

/**
 * Safely appends a child node to a parent
 * 
 * @param parent The parent node
 * @param child The child node to append
 * @returns boolean indicating success
 */
export function safeAppendChild(parent: Node, child: Node): boolean {
  if (!parent || !child) return false;
  
  try {
    // If the node already has a parent, remove it first
    if (child.parentNode && child.parentNode !== parent) {
      safeRemoveChild(child.parentNode, child);
    }
    
    // Append the child to the parent
    parent.appendChild(child);
    return true;
  } catch (error) {
    console.warn('Safe DOM append error:', error);
    return false;
  }
}

/**
 * Safely inserts a node before a reference node
 * 
 * @param parent The parent node
 * @param newNode The node to insert
 * @param referenceNode The reference node
 * @returns boolean indicating success
 */
export function safeInsertBefore(parent: Node, newNode: Node, referenceNode: Node | null): boolean {
  if (!parent || !newNode) return false;
  
  try {
    // If the new node already has a parent, remove it first
    if (newNode.parentNode && newNode.parentNode !== parent) {
      safeRemoveChild(newNode.parentNode, newNode);
    }
    
    // If reference node is null or not a child of parent, append the child
    if (!referenceNode || !parent.contains(referenceNode)) {
      return safeAppendChild(parent, newNode);
    }
    
    // Insert the node
    parent.insertBefore(newNode, referenceNode);
    return true;
  } catch (error) {
    console.warn('Safe DOM insertBefore error:', error);
    // Try appendChild as fallback
    try {
      return safeAppendChild(parent, newNode);
    } catch (e) {
      console.warn('Safe DOM insertBefore fallback error:', e);
      return false;
    }
  }
}

/**
 * Utility to safely cleanup orphaned portal elements
 */
export function cleanupOrphanedPortals(): void {
  try {
    const portals = document.querySelectorAll('[data-radix-portal]');
    portals.forEach(portal => {
      if (portal.children.length === 0 && portal.parentNode) {
        safeRemoveChild(portal.parentNode, portal);
      }
    });
  } catch (error) {
    console.warn('Portal cleanup error:', error);
  }
}
