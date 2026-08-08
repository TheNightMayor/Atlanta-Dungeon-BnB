import React from 'react';
import { useFormValue } from 'sanity';

type Props = any;

const PublicUrlInput: React.FC<Props> = (props) => {
  const { document } = props;
  const slugValue = useFormValue(['slug', 'current']);
  const slug = slugValue || document?.slug?.current;
  const base = (process.env.NEXT_PUBLIC_APP_URL || process.env.SANITY_PUBLIC_APP_URL || 'https://example.com').replace(/\/$/, '');

  const url = slug ? `${base}/rooms/${slug}` : '';

  return (
    <div style={{ paddingTop: 6 }}>
      {url ? (
        <a href={url} target="_blank" rel="noreferrer noopener" style={{ color: '#2563eb', textDecoration: 'underline' }}>
          {url}
        </a>
      ) : (
        <div style={{ color: '#6b7280' }}>Slug not set yet — URL will appear after saving or when slug is filled</div>
      )}
    </div>
  );
};

export default PublicUrlInput;
