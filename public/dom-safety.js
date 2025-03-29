
/**
 * DOM Safety Module
 * Enhances the safety of DOM operations by patching core DOM methods
 */

(function() {
  console.log('🔄 Loading DOM safety patches...');
  
  // Enhanced patches for React DOM manipulation errors
  window.__fixDOMErrors = function() {
    // Patch the document.createElement to add custom properties for debugging
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
      const element = originalCreateElement.apply(document, arguments);
      element._createdAt = new Date().getTime();
      element._createdBy = 'patched-create-element';
      return element;
    };
    
    // Patch removeChild to be safer
    const originalRemoveChild = Node.prototype.removeChild;
    Node.prototype.removeChild = function(child) {
      if (!child) {
        console.warn('⚠️ Safe DOM: Prevented removeChild call with null/undefined child');
        return null;
      }
      
      try {
        // Check if child is actually a child of this node
        if (this.contains(child)) {
          return originalRemoveChild.call(this, child);
        } else {
          console.warn('⚠️ Safe DOM: Prevented removeChild error for a non-child node', {
            parent: this,
            child: child
          });
          
          // Attempt to find and remove from actual parent if possible
          if (child.parentNode) {
            console.log('🔍 Safe DOM: Found actual parent, removing properly');
            return child.parentNode.removeChild(child);
          }
          
          return child;
        }
      } catch (e) {
        console.warn('⚠️ Safe DOM: Caught error in removeChild', e);
        return child;
      }
    };
    
    // Patch appendChild to be safer too
    const originalAppendChild = Node.prototype.appendChild;
    Node.prototype.appendChild = function(child) {
      if (!child) {
        console.warn('⚠️ Safe DOM: Prevented appendChild call with null/undefined child');
        return null;
      }
      
      try {
        // If the node already has a parent, remove it first to avoid DOM hierarchy issues
        if (child.parentNode && child.parentNode !== this) {
          child.parentNode.removeChild(child);
        }
        return originalAppendChild.call(this, child);
      } catch (e) {
        console.warn('⚠️ Safe DOM: Caught error in appendChild', e);
        return child;
      }
    };
    
    // Patch insertBefore to be safer
    const originalInsertBefore = Node.prototype.insertBefore;
    Node.prototype.insertBefore = function(newNode, referenceNode) {
      if (!newNode) {
        console.warn('⚠️ Safe DOM: Prevented insertBefore call with null/undefined newNode');
        return null;
      }
      
      try {
        // If the new node already has a parent, remove it first
        if (newNode.parentNode && newNode.parentNode !== this) {
          newNode.parentNode.removeChild(newNode);
        }
        
        // Handle null referenceNode (appendChild behavior)
        if (!referenceNode) {
          return this.appendChild(newNode);
        }
        
        // Check if reference node is actually a child
        if (!this.contains(referenceNode)) {
          console.warn('⚠️ Safe DOM: Reference node is not a child in insertBefore');
          return this.appendChild(newNode);
        }
        
        return originalInsertBefore.call(this, newNode, referenceNode);
      } catch (e) {
        console.warn('⚠️ Safe DOM: Caught error in insertBefore', e);
        try {
          // Fallback to appendChild if insertBefore fails
          return this.appendChild(newNode);
        } catch (e2) {
          console.warn('⚠️ Safe DOM: Fallback appendChild also failed', e2);
          return newNode;
        }
      }
    };
    
    console.log('✅ DOM safety patches applied');
  };

  // Apply the DOM fixes immediately
  window.__fixDOMErrors();
})();
