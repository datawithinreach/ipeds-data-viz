import BrowserOnly from '@docusaurus/BrowserOnly';
import Layout from '@theme/Layout';
import '@/components/article/article.scss';
import '../features/components-page/components.scss';
import { ComponentsList } from '../features/components-page/ComponentsList';

export default function ComponentsPage() {
  return (
    <Layout title="Components" description="Shared IPEDS Data Viz components">
      <BrowserOnly
        fallback={<div className="components-page__loading">Loading components...</div>}
      >
        {() => <ComponentsList />}
      </BrowserOnly>
    </Layout>
  );
}
