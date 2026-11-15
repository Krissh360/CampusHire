export const APP_NAME = 'SPARK';
export const APP_FULL_NAME = 'Student Placement And Recruitment Kit';
export const APP_TAGLINE = 'Every placement, one platform.';

export const STORAGE_KEYS = {
  theme: 'spark-theme',
  token: 'spark_token',
  user: 'spark_user',
};

export const LEGACY_STORAGE_KEYS = {
  theme: 'campushire-theme',
  token: 'campushire_token',
  user: 'campushire_user',
};

export function readMigratedStorage(key, legacyKey) {
  const currentValue = localStorage.getItem(key);
  if (currentValue) return currentValue;

  const legacyValue = localStorage.getItem(legacyKey);
  if (legacyValue) {
    localStorage.setItem(key, legacyValue);
    localStorage.removeItem(legacyKey);
  }
  return legacyValue;
}
