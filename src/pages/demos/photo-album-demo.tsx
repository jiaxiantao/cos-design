import { PhotoAlbum, type PhotoAlbumItem, type PhotoAlbumProps } from '@/components';
import { useTranslation } from 'react-i18next';

const PHOTO_URLS = [
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=85'
];

const PhotoAlbumDemo = () => {
  const { t } = useTranslation();
  const copy = t('demos.componentCopy.photoAlbumPhotos', { returnObjects: true }) as Array<
    Pick<PhotoAlbumItem, 'title' | 'description'>
  >;
  const photos = PHOTO_URLS.map((src, index) => ({ src, ...copy[index], alt: copy[index]?.title }));

  return (
    <PhotoAlbum
      photos={photos}
      width={780}
      height={475}
      labels={t('demos.componentCopy.photoAlbumLabels', { returnObjects: true }) as PhotoAlbumProps['labels']}
      ariaLabel={t('demos.componentCopy.photoAlbumAria')}
    />
  );
};

export default PhotoAlbumDemo;
