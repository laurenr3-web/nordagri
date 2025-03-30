
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
      try {
        child.parentNode.removeChild(child);
      } catch (e) {
        console.warn('Error removing child from previous parent:', e);
        // Continue anyway to try the append
      }
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
      try {
        newNode.parentNode.removeChild(newNode);
      } catch (e) {
        console.warn('Error removing node from previous parent:', e);
        // Continue anyway to try the insert
      }
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
        try {
          portal.parentNode.removeChild(portal);
          console.log('Cleaned up orphaned portal');
        } catch (e) {
          console.warn('Portal cleanup error:', e);
        }
      }
    });
    
    // Also clean up other common React portal elements
    const reactModals = document.querySelectorAll('.ReactModal__Overlay, .ReactModal__Content');
    reactModals.forEach(modal => {
      if (modal.parentNode && (modal as HTMLElement).style.display === 'none') {
        try {
          modal.parentNode.removeChild(modal);
          console.log('Cleaned up hidden React modal');
        } catch (e) {
          console.warn('Modal cleanup error:', e);
        }
      }
    });
  } catch (error) {
    console.warn('Portal cleanup error:', error);
  }
}

/**
 * Patches common DOM APIs to make them safe against React bugs
 */
export function patchDomOperations(): void {
  // Backup original methods
  const originalRemoveChild = Node.prototype.removeChild;
  const originalAppendChild = Node.prototype.appendChild;
  const originalInsertBefore = Node.prototype.insertBefore;
  
  // Patch removeChild
  Node.prototype.removeChild = function(child) {
    if (!child) {
      console.warn('Safe DOM: Prevented removeChild call with null/undefined child');
      return null;
    }
    
    try {
      // Check if child is actually a child of this node
      if (this.contains(child)) {
        return originalRemoveChild.call(this, child);
      } else {
        console.warn('Safe DOM: removeChild called for non-child node');
        
        // Try to find and remove from actual parent if possible
        if (child.parentNode) {
          console.log('Found actual parent, removing properly');
          return child.parentNode.removeChild(child);
        }
        
        return child;
      }
    } catch (e) {
      console.warn('Caught error in removeChild:', e);
      return child;
    }
  };
  
  // Patch appendChild to be safer
  Node.prototype.appendChild = function(child) {
    if (!child) {
      console.warn('Safe DOM: Prevented appendChild call with null/undefined child');
      return null;
    }
    
    try {
      // If the node already has a parent, remove it first to avoid DOM hierarchy issues
      if (child.parentNode && child.parentNode !== this) {
        try {
          child.parentNode.removeChild(child);
        } catch (e) {
          console.warn('Error removing from previous parent:', e);
        }
      }
      return originalAppendChild.call(this, child);
    } catch (e) {
      console.warn('Caught error in appendChild:', e);
      return child;
    }
  };
  
  // Patch insertBefore
  Node.prototype.insertBefore = function(newNode, referenceNode) {
    if (!newNode) {
      console.warn('Safe DOM: Prevented insertBefore call with null/undefined newNode');
      return null;
    }
    
    try {
      // If the new node already has a parent, remove it first
      if (newNode.parentNode && newNode.parentNode !== this) {
        try {
          newNode.parentNode.removeChild(newNode);
        } catch (e) {
          console.warn('Error removing from previous parent:', e);
        }
      }
      
      // Handle null referenceNode (appendChild behavior)
      if (!referenceNode) {
        return this.appendChild(newNode);
      }
      
      // Check if reference node is actually a child
      if (!this.contains(referenceNode)) {
        console.warn('Reference node is not a child in insertBefore');
        return this.appendChild(newNode);
      }
      
      return originalInsertBefore.call(this, newNode, referenceNode);
    } catch (e) {
      console.warn('Caught error in insertBefore:', e);
      try {
        // Fallback to appendChild if insertBefore fails
        return this.appendChild(newNode);
      } catch (e2) {
        console.warn('Fallback appendChild also failed:', e2);
        return newNode;
      }
    }
  };
}
