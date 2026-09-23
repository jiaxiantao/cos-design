import { PhotoClothesline, type PhotoClotheslineItem } from '@/components';
import { useTranslation } from 'react-i18next';

const PHOTO_URLS = [
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=900&q=85',
];

const PhotoClotheslineDemo = () => {
  const { t } = useTranslation();
  const copy = t('demos.componentCopy.photoAlbumPhotos', { returnObjects: true }) as Array<
    Pick<PhotoClotheslineItem, 'title' | 'description'>
  >;
  const photos = PHOTO_URLS.map((src, index) => ({ src, ...copy[index], alt: copy[index]?.title }));

  return (
    <div style={{ width: '100%', display: 'grid', gap: 12, justifyItems: 'center' }}>
      <PhotoClothesline
        photos={photos}
        height={480}
        ariaLabel={t('demos.componentCopy.photoClotheslineAria')}
      />
      <p style={{ margin: 0, fontSize: 13, opacity: 0.7 }}>
        {t('demos.componentCopy.photoClotheslineHint')}
      </p>
    </div>
  );
};

export default PhotoClotheslineDemo;
