/**
 * Shyft Sg - File Storage Service Interface
 * 
 * Platform-agnostic abstraction for file storage.
 * Defaults to mock storage for localhost, ready for AWS S3 in production.
 */

export interface UploadResult {
    url: string;
    key: string;
    bucket?: string;
}

export interface FileStorageService {
    /**
     * Upload a file and return its accessible URL
     */
    upload(file: Buffer | Blob, filename: string, folder?: string): Promise<UploadResult>;

    /**
     * Delete a file by its key
     */
    delete(key: string): Promise<void>;

    /**
     * Get a signed URL for private file access (for S3)
     */
    getSignedUrl(key: string, expiresIn?: number): Promise<string>;
}

/**
 * Mock Storage Service for Local Development
 * Returns placeholder URLs - files are NOT actually stored
 */
class MockStorageService implements FileStorageService {
    private baseUrl = '/api/mock-storage';

    async upload(file: Buffer | Blob, filename: string, folder = 'uploads'): Promise<UploadResult> {
        // Generate a mock key
        const timestamp = Date.now();
        const key = `${folder}/${timestamp}-${filename}`;

        console.log(`[MockStorage] Simulating upload: ${key}`);

        return {
            url: `${this.baseUrl}/${key}`,
            key,
        };
    }

    async delete(key: string): Promise<void> {
        console.log(`[MockStorage] Simulating delete: ${key}`);
    }

    async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
        console.log(`[MockStorage] Generating mock signed URL for: ${key}, expires in ${expiresIn}s`);
        return `${this.baseUrl}/${key}?mock-signed=true`;
    }
}

/**
 * AWS S3 Storage Service (Production)
 * 
 * To enable S3:
 * 1. Install @aws-sdk/client-s3 and @aws-sdk/s3-request-presigner
 * 2. Set environment variables: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET
 * 3. Update getStorageService() to return S3StorageService instance
 */
class S3StorageService implements FileStorageService {
    // Placeholder - implement when ready for production
    async upload(file: Buffer | Blob, filename: string, folder = 'uploads'): Promise<UploadResult> {
        // TODO: Implement S3 upload using @aws-sdk/client-s3
        throw new Error('S3 storage not yet configured. Install @aws-sdk/client-s3 and configure credentials.');
    }

    async delete(key: string): Promise<void> {
        // TODO: Implement S3 delete
        throw new Error('S3 storage not yet configured.');
    }

    async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
        // TODO: Implement using @aws-sdk/s3-request-presigner
        throw new Error('S3 storage not yet configured.');
    }
}

/**
 * Factory function to get the appropriate storage service
 * 
 * Environment variable: STORAGE_PROVIDER
 * - 'mock' or undefined: MockStorageService (development)
 * - 's3': S3StorageService (production)
 */
export function getStorageService(): FileStorageService {
    const provider = process.env.STORAGE_PROVIDER || 'mock';

    switch (provider) {
        case 's3':
            return new S3StorageService();
        case 'mock':
        default:
            return new MockStorageService();
    }
}

// Export singleton instance
export const storageService = getStorageService();
