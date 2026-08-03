import { PhotoLantern, type PhotoLanternItem } from '@/components';
import { useTranslation } from 'react-i18next';

const PHOTO_URLS = [
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=85'
];

const PhotoLanternDemo = () => {
  const { t } = useTranslation();
  const copy = t('demos.componentCopy.photoLanternPhotos', { returnObjects: true }) as Array<
    Pick<PhotoLanternItem, 'title' | 'description'>
  >;
  const photos = PHOTO_URLS.map((src, index) => ({ src, ...copy[index], alt: copy[index]?.title }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <PhotoLantern
        photos={photos}
        width={400}
        height={560}
        showCaption
        ariaLabel={t('demos.componentCopy.photoLanternAria')}
      />
      <p style={{ margin: 0, fontSize: 13, opacity: 0.7 }}>{t('demos.componentCopy.photoLanternHint')}</p>
    </div>
  );
};

export default PhotoLanternDemo;
