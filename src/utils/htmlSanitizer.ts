
/**
 * Utilities for safe HTML manipulation to prevent XSS attacks
 */

/**
 * Safely set text content without using innerHTML
 */
export const setTextContent = (element: HTMLElement, text: string): void => {
  element.textContent = text;
};

/**
 * Safely create DOM elements with content
 */
export const createElement = (
  tagName: string, 
  options?: {
    textContent?: string;
    className?: string;
    id?: string;
    attributes?: Record<string, string>;
  }
): HTMLElement => {
  const element = document.createElement(tagName);
  
  if (options?.textContent) {
    element.textContent = options.textContent;
  }
  
  if (options?.className) {
    element.className = options.className;
  }
  
  if (options?.id) {
    element.id = options.id;
  }
  
  if (options?.attributes) {
    Object.entries(options.attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }
  
  return element;
};

/**
 * Safely replace document body content for printing
 */
export const safePrintContent = (content: {
  title?: string;
  body: HTMLElement[];
  styles?: string;
}): void => {
  // Store original content
  const originalBody = document.body.cloneNode(true);
  
  try {
    // Clear body safely
    document.body.innerHTML = '';
    
    // Add title if provided
    if (content.title) {
      const titleElement = createElement('h1', { 
        textContent: content.title,
        className: 'print-title'
      });
      document.body.appendChild(titleElement);
    }
    
    // Add body content
    content.body.forEach(element => {
      document.body.appendChild(element);
    });
    
    // Add styles safely
    if (content.styles) {
      const styleElement = createElement('style');
      styleElement.textContent = content.styles;
      document.head.appendChild(styleElement);
    }
    
    // Print
    window.print();
    
  } finally {
    // Restore original content
    document.body.innerHTML = '';
    document.body.appendChild(originalBody);
  }
};

/**
 * Basic HTML sanitization for user input
 */
export const sanitizeHtml = (html: string): string => {
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
};
