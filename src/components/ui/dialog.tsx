import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  // Create a ref to track if the content is mounted
  const isMountedRef = React.useRef(true);
  
  // Create a local ref for keeping track of events
  const localStateRef = React.useRef({
    isClosing: false,
    closeStartTime: 0
  });
  
  // Set up an effect to manage the mounted state
  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Enhanced function to safely get dialog element
  const getDialogElement = (forwardedRef: React.ForwardedRef<HTMLDivElement> | null) => {
    if (!forwardedRef) return null;
    
    // Handle RefObject (with current property)
    if (typeof forwardedRef === 'object' && forwardedRef !== null && 'current' in forwardedRef) {
      return forwardedRef.current;
    }
    
    // For callback refs, we can't access directly
    return null;
  };

  // Enhanced handler for safe dialog closing
  const handleEscapeKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // Prevent default browser behavior
    event.preventDefault();
    
    // Only proceed if not already closing
    if (localStateRef.current.isClosing) return;
    
    // Mark dialog as closing
    localStateRef.current.isClosing = true;
    localStateRef.current.closeStartTime = Date.now();
    
    // Log the action for debugging
    console.log('Dialog: Escape key pressed, initiating safe close');
    
    // Use a safer approach to closing with animation frame scheduling
    if (isMountedRef.current) {
      requestAnimationFrame(() => {
        if (isMountedRef.current) {
          // Try to set the dialog state to "closed" via data attribute
          const dialog = getDialogElement(ref);
          if (dialog && dialog instanceof HTMLElement) {
            console.log('Dialog: Setting data-state to closed');
            dialog.dataset.state = "closed";
            
            // Add a backup close trigger after animation completes
            setTimeout(() => {
              if (props.onEscapeKeyDown) {
                props.onEscapeKeyDown(event);
              }
            }, 300);
          } else {
            // Fallback if we can't access the element
            if (props.onEscapeKeyDown) {
              props.onEscapeKeyDown(event);
            }
          }
        }
      });
    }
  };
  
  // Enhanced handler for outside clicks
  const handlePointerDownOutside = (event: React.PointerEvent<HTMLDivElement>) => {
    // Only prevent outside clicks if dialog is just opening or already closing
    const timeSinceClose = Date.now() - localStateRef.current.closeStartTime;
    if (localStateRef.current.isClosing && timeSinceClose < 500) {
      event.preventDefault();
      return;
    }
    
    // Let the default behavior happen for normal outside clicks
    if (props.onPointerDownOutside) {
      props.onPointerDownOutside(event);
    }
  };

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg md:max-h-[95vh] md:overflow-y-auto",
          className
        )}
        onEscapeKeyDown={handleEscapeKeyDown}
        onPointerDownOutside={handlePointerDownOutside}
        // Add enhanced close animation handling
        onCloseAutoFocus={(event) => {
          // Reset closing state
          localStateRef.current.isClosing = false;
          
          // Proceed with normal handler
          if (props.onCloseAutoFocus) {
            props.onCloseAutoFocus(event);
          }
        }}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
})
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
