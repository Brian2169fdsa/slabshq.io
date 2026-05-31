import { Phase2Shell } from '@/components/Phase2Shell';

export default function PlaceholderPage({ params }: { params: { slug: string } }) {
  const title = params.slug.charAt(0).toUpperCase() + params.slug.slice(1);
  return <Phase2Shell title={title} blurb="This category is in the prototype but not yet provisioned as a tenant_category for the demo tenant." />;
}
