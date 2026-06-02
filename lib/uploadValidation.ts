const IMAGE_MIME_TO_EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const RETURN_MIME_TO_EXTENSION: Record<string, string> = {
  ...IMAGE_MIME_TO_EXTENSION,
  'application/pdf': 'pdf',
};

export const IMAGE_UPLOAD_MAX_BYTES = 8 * 1024 * 1024;
export const AVATAR_UPLOAD_MAX_BYTES = 4 * 1024 * 1024;
export const RETURN_EVIDENCE_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;

type UploadValidationInput = {
  fileName?: unknown;
  contentType?: unknown;
  size?: unknown;
  allowedTypes: Record<string, string>;
  maxBytes: number;
};

export type ValidatedUpload = {
  safeName: string;
  extension: string;
  contentType: string;
  maxBytes: number;
};

function sanitizeBaseName(value: string) {
  const name = value
    .toLowerCase()
    .trim()
    .replace(/\\/g, '/')
    .split('/')
    .pop()
    ?.replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64);

  return name || 'upload';
}

export function validateUploadRequest(input: UploadValidationInput): ValidatedUpload {
  const contentType = typeof input.contentType === 'string' ? input.contentType.trim().toLowerCase() : '';
  const extension = input.allowedTypes[contentType];

  if (!extension) {
    throw new Error('Desteklenmeyen dosya turu');
  }

  if (typeof input.size === 'number' && Number.isFinite(input.size)) {
    if (input.size <= 0 || input.size > input.maxBytes) {
      throw new Error(`Dosya boyutu ${Math.floor(input.maxBytes / 1024 / 1024)} MB sinirini asmamali`);
    }
  }

  const baseName = sanitizeBaseName(typeof input.fileName === 'string' ? input.fileName : 'upload');

  return {
    safeName: `${baseName}.${extension}`,
    extension,
    contentType,
    maxBytes: input.maxBytes,
  };
}

export function validateImageUpload(input: Omit<UploadValidationInput, 'allowedTypes' | 'maxBytes'>, maxBytes = IMAGE_UPLOAD_MAX_BYTES) {
  return validateUploadRequest({
    ...input,
    allowedTypes: IMAGE_MIME_TO_EXTENSION,
    maxBytes,
  });
}

export function validateReturnEvidenceUpload(input: Omit<UploadValidationInput, 'allowedTypes' | 'maxBytes'>) {
  return validateUploadRequest({
    ...input,
    allowedTypes: RETURN_MIME_TO_EXTENSION,
    maxBytes: RETURN_EVIDENCE_UPLOAD_MAX_BYTES,
  });
}
