import { PhotoFridge, type PhotoFridgeItem } from '@/components';
import { useTranslation } from 'react-i18next';

const PHOTO_URLS = [
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=85',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=85',
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=600&q=85',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=85',
  'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=600&q=85',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=85'
];

const PhotoFridgeDemo = () => {
  const { t } = useTranslation();
  const copy = t('demos.componentCopy.photoAlbumPhotos', { returnObjects: true }) as Array<
    Pick<PhotoFridgeItem, 'title' | 'description'>
  >;
  const photos = PHOTO_URLS.map((src, index) => ({ src, ...copy[index], alt: copy[index]?.title }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <PhotoFridge
        photos={photos}
        width={420}
        height={480}
        showCaption
        ariaLabel={t('demos.componentCopy.photoFridgeAria')}
      />
      <p style={{ margin: 0, fontSize: 13, opacity: 0.7 }}>{t('demos.componentCopy.photoFridgeHint')}</p>
    </div>
  );
};

export default PhotoFridgeDemo;
