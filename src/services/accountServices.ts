export const getAccountProvider = async (userId: string) => {
  try {
    const response = await fetch(`api/account/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch account');
    }

    const account = await response.json();
    return account.providerId;
  } catch (error) {
    console.error('Error fetching account:', error);
    throw error;
  }
};