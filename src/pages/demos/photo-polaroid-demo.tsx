import { PhotoPolaroid, type PhotoPolaroidItem } from '@/components';
import { useTranslation } from 'react-i18next';

const PHOTO_URLS = [
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=85',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=85',
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=600&q=85',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=85',
  'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=600&q=85',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=85'
];

const PhotoPolaroidDemo = () => {
  const { t } = useTranslation();
  const copy = t('demos.componentCopy.photoAlbumPhotos', { returnObjects: true }) as Array<
    Pick<PhotoPolaroidItem, 'title' | 'description'>
  >;
  const photos = PHOTO_URLS.map((src, index) => ({ src, ...copy[index], alt: copy[index]?.title }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%' }}>
      <PhotoPolaroid photos={photos} height={420} showCaption ariaLabel={t('demos.componentCopy.photoPolaroidAria')} />
      <p style={{ margin: 0, fontSize: 13, opacity: 0.7 }}>{t('demos.componentCopy.photoPolaroidHint')}</p>
    </div>
  );
};

export default PhotoPolaroidDemo;
