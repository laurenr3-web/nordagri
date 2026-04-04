const PREVIEW_TOKEN_PARAM = '__lovable_token';

export const getPreviewToken = (search?: string) => {
  if (typeof window === 'undefined') {
    return null;
  }

  const params = new URLSearchParams(search ?? window.location.search);
  return params.get(PREVIEW_TOKEN_PARAM);
};

export const withPreviewToken = (path: string, search?: string) => {
  if (typeof window === 'undefined') {
    return path;
  }

  const token = getPreviewToken(search);
  if (!token) {
    return path;
  }

  const url = new URL(path, window.location.origin);

  if (!url.searchParams.has(PREVIEW_TOKEN_PARAM)) {
    url.searchParams.set(PREVIEW_TOKEN_PARAM, token);
  }

  return `${url.pathname}${url.search}${url.hash}`;
};

export const buildReturnPath = (pathname: string, search = '', hash = '') => {
  const params = new URLSearchParams(search);
  params.delete(PREVIEW_TOKEN_PARAM);

  const cleanedSearch = params.toString();
  return `${pathname}${cleanedSearch ? `?${cleanedSearch}` : ''}${hash}`;
};