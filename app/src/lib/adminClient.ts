const bridgeBaseUrl = (import.meta.env.VITE_BRIDGE_URL ?? 'http://localhost:8787').replace(
  /\/$/,
  ''
);

type VerifyPinResponse = {
  success: boolean;
  valid: boolean;
  adminToken?: string;
  expiresInSeconds?: number;
};

export const verifyAdminPin = async (
  pin: string,
  signal?: AbortSignal
): Promise<{ valid: boolean; adminToken: string | null; expiresInSeconds: number | null }> => {
  const response = await fetch(`${bridgeBaseUrl}/admin/verify-pin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ pin }),
    signal
  });

  if (!response.ok) {
    throw new Error(`PIN verification failed with status ${response.status}`);
  }

  const result = (await response.json()) as VerifyPinResponse;
  const rawToken = typeof result.adminToken === 'string' ? result.adminToken.trim() : '';
  const hasToken = rawToken.length > 0;

  return {
    valid: result.valid === true && hasToken,
    adminToken: hasToken ? rawToken : null,
    expiresInSeconds:
      typeof result.expiresInSeconds === 'number' && Number.isFinite(result.expiresInSeconds)
        ? result.expiresInSeconds
        : null
  };
};
