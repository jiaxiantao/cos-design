import { PhotoViewMaster, type PhotoViewMasterItem } from '@/components';
import { useTranslation } from 'react-i18next';

const PHOTO_URLS = [
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=85'
];

const PhotoViewMasterDemo = () => {
  const { t } = useTranslation();
  const copy = t('demos.componentCopy.photoAlbumPhotos', { returnObjects: true }) as Array<
    Pick<PhotoViewMasterItem, 'title' | 'description'>
  >;
  const photos = PHOTO_URLS.map((src, index) => ({ src, ...copy[index], alt: copy[index]?.title }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <PhotoViewMaster
        photos={photos}
        width={380}
        height={420}
        showCaption
        autoRotate
        ariaLabel={t('demos.componentCopy.photoViewMasterAria')}
      />
      <p style={{ margin: 0, fontSize: 13, opacity: 0.7 }}>{t('demos.componentCopy.photoViewMasterHint')}</p>
    </div>
  );
};

export default PhotoViewMasterDemo;
