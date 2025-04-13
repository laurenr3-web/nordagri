
import { runTypeValidations } from './types/typeValidations';

// Export the function to be run manually or by automated tests
export default function validateTypes(): void {
  console.log('Running type validations...');
  runTypeValidations();
}

// If running in browser or dev environment, execute immediately
if (process.env.NODE_ENV === 'development') {
  try {
    validateTypes();
  } catch (e) {
    console.error('Type validation failed:', e);
  }
}
