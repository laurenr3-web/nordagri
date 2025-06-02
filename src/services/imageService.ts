
/**
 * Service pour la gestion avancée des images
 */
export interface ImageMetadata {
  url: string;
  size?: number;
  dimensions?: { width: number; height: number };
  format?: string;
  quality?: 'low' | 'medium' | 'high';
  loadTime?: number;
}

export interface ImageRetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
}

export class ImageService {
  private static readonly DEFAULT_RETRY_OPTIONS: Required<ImageRetryOptions> = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 8000,
    backoffFactor: 2
  };

  /**
   * Charge une image avec retry automatique et backoff exponentiel
   */
  static async loadImageWithRetry(
    url: string, 
    options: ImageRetryOptions = {}
  ): Promise<ImageMetadata> {
    const opts = { ...this.DEFAULT_RETRY_OPTIONS, ...options };
    let lastError: Error;

    for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
      try {
        const startTime = Date.now();
        const metadata = await this.loadImage(url);
        const loadTime = Date.now() - startTime;
        
        return {
          ...metadata,
          loadTime,
          quality: this.assessImageQuality(metadata)
        };
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < opts.maxRetries) {
          const delay = Math.min(
            opts.baseDelay * Math.pow(opts.backoffFactor, attempt),
            opts.maxDelay
          );
          
          console.log(`Image load attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
          await this.delay(delay);
        }
      }
    }

    throw new Error(`Failed to load image after ${opts.maxRetries + 1} attempts: ${lastError.message}`);
  }

  /**
   * Charge une image et récupère ses métadonnées
   */
  private static loadImage(url: string): Promise<ImageMetadata> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculer la taille approximative (estimation)
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const estimatedSize = imageData.data.length;
          
          resolve({
            url,
            size: estimatedSize,
            dimensions: {
              width: img.naturalWidth,
              height: img.naturalHeight
            },
            format: this.getImageFormat(url)
          });
        } else {
          resolve({
            url,
            dimensions: {
              width: img.naturalWidth,
              height: img.naturalHeight
            },
            format: this.getImageFormat(url)
          });
        }
      };

      img.onerror = () => {
        reject(new Error(`Failed to load image: ${url}`));
      };

      img.src = url;
    });
  }

  /**
   * Compresse une image côté client
   */
  static async compressImage(
    file: File, 
    maxWidth: number = 1920, 
    maxHeight: number = 1080, 
    quality: number = 0.8
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculer les nouvelles dimensions en gardant le ratio
        const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
        const newWidth = img.width * ratio;
        const newHeight = img.height * ratio;

        canvas.width = newWidth;
        canvas.height = newHeight;

        if (ctx) {
          ctx.drawImage(img, 0, 0, newWidth, newHeight);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to compress image'));
              }
            },
            'image/jpeg',
            quality
          );
        } else {
          reject(new Error('Failed to get canvas context'));
        }
      };

      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Évalue la qualité d'une image basée sur ses métadonnées
   */
  private static assessImageQuality(metadata: ImageMetadata): 'low' | 'medium' | 'high' {
    if (!metadata.dimensions) return 'medium';
    
    const { width, height } = metadata.dimensions;
    const totalPixels = width * height;

    if (totalPixels < 500000) return 'low'; // < 0.5MP
    if (totalPixels < 2000000) return 'medium'; // < 2MP
    return 'high'; // >= 2MP
  }

  /**
   * Détermine le format d'image à partir de l'URL
   */
  private static getImageFormat(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'JPEG';
      case 'png':
        return 'PNG';
      case 'webp':
        return 'WebP';
      case 'gif':
        return 'GIF';
      default:
        return 'Unknown';
    }
  }

  /**
   * Délai pour le backoff exponentiel
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Formate la taille d'un fichier pour l'affichage
   */
  static formatFileSize(bytes?: number): string {
    if (!bytes) return 'Taille inconnue';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }
}
