const bridgeBaseUrl = (import.meta.env.VITE_BRIDGE_URL ?? 'http://localhost:8787').replace(
  /\/$/,
  ''
);

type VerifyPinResponse = {
  success: boolean;
  valid: boolean;
};

export const verifyAdminPin = async (
  pin: string,
  signal?: AbortSignal
): Promise<boolean> => {
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
  return result.valid === true;
};
