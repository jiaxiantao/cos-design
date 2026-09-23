import { useTranslation } from 'react-i18next';
import { Fireworks } from '@/components';

const FireworksDemo = () => {
  const { t } = useTranslation();

  return (
    <Fireworks
      auto={false}
      interactive
      width={800}
      height={500}
      hint={t('demos.componentCopy.fireworksHint')}
    />
  );
};

export default FireworksDemo;
