import type { Category } from '@/lib/types';
import { CAT_LABEL, catSlug } from '@/lib/types';

export function CatLabel({ cat }: { cat: Category }) {
  return <span className={`cat-label ${catSlug(cat)}`}>{CAT_LABEL[cat]}</span>;
}
