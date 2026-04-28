import Image from 'next/image';
import getImageUrl from '@/libs/imageUrl';

const PortableTextImage = ({ value }: any) => {
  const src = getImageUrl(value);
  if (!src) return null;

  return (
    <figure className="my-8">
      <Image
        src={src}
        alt={value.alt || 'Sanity image'}
        width={1200}
        height={800}
        className="mx-auto rounded-2xl object-cover w-full h-auto"
      />
      {value.caption && (
        <figcaption className="mt-3 text-sm text-center text-gray-500 dark:text-gray-400">
          {value.caption}
        </figcaption>
      )}
    </figure>
  );
};

export const portableTextComponents: any = {
  block: {
    h1: ({ children }: any) => <h1 className="py-4 text-2xl md:text-4xl font-orbitron">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-xl font-orbitron">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-lg font-orbitron">{children}</h3>,
    normal: ({ children }: any) => <p className="text-base leading-10">{children}</p>,
    hr: () => <hr className="my-6 border-gray-200" />,
  },
  marks: {
    link: ({ children, value }: any) => {
      const href = value?.href || '';
      const target = href.startsWith('http') ? '_blank' : undefined;
      return (
        <a
          href={href}
          target={target}
          rel={target ? 'noopener noreferrer' : undefined}
          className="text-primary underline"
        >
          {children}
        </a>
      );
    },
  },
  list: {
    bullet: ({ children }: any) => <ul className="list-disc pl-6">{children}</ul>,
    number: ({ children }: any) => <ol className="list-decimal pl-6">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }: any) => <li className="mb-1">{children}</li>,
    number: ({ children }: any) => <li className="mb-1">{children}</li>,
  },
  types: {
    image: PortableTextImage,
  },
};
