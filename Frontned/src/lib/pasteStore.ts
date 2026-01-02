// API-based paste storage

const API_BASE = (import.meta as any).env?.VITE_API_URL || '';

export interface Paste {
  id: string;
  content: string;
  created_at: number;
  expires_at: number | null;
  max_views: number | null;
  view_count: number;
}

export interface PasteResponse {
  content: string;
  remaining_views: number | null;
  expires_at: string | null;
}

export interface PasteError {
  error: string;
  code: 'NOT_FOUND' | 'EXPIRED' | 'VIEW_LIMIT_EXCEEDED' | 'NETWORK_ERROR';
}

export async function createPaste(
  content: string,
  ttlSeconds?: number,
  maxViews?: number
): Promise<{ id: string; url: string }> {
  const body: Record<string, unknown> = { content };
  if (ttlSeconds !== undefined) body.ttl_seconds = ttlSeconds;
  if (maxViews !== undefined) body.max_views = maxViews;

  const response = await fetch(`${API_BASE}/api/pastes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to create paste' }));
    throw new Error(error.error || 'Failed to create paste');
  }

  const data = await response.json();
  // Construct URL using current origin (frontend URL)
  const url = `${window.location.origin}/p/${data.id}`;
  return { id: data.id, url };
}

export async function getPaste(
  id: string
): Promise<{ success: true; data: PasteResponse } | { success: false; error: PasteError }> {
  try {
    const response = await fetch(`${API_BASE}/api/pastes/${id}`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Paste not found' }));
      return {
        success: false,
        error: { 
          error: error.error || 'Paste not found', 
          code: response.status === 404 ? 'NOT_FOUND' : 'NETWORK_ERROR' 
        },
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: { error: 'Network error', code: 'NETWORK_ERROR' },
    };
  }
}

// Check health
export async function checkHealth(): Promise<{ ok: boolean }> {
  try {
    const response = await fetch(`${API_BASE}/api/healthz`);
    if (!response.ok) return { ok: false };
    return response.json();
  } catch {
    return { ok: false };
  }
}
