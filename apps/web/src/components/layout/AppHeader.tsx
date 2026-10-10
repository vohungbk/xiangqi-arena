import Link from 'next/link';
import { HOME_HREF } from '@/lib/nav-items';
import { TopMenu } from './TopMenu';

const APP_NAME = 'Xiangqi Arena - Cờ Tướng Arena';
const APP_TAGLINE = 'Nền tảng Cờ Tướng Trực Tuyến';

export function AppHeader() {
  return (
    <header className="border-b border-white/10 px-6 pt-4">
      <Link href={HOME_HREF} className="flex w-fit items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gold text-xl text-gold"
        >
          帥
        </span>
        <span className="flex flex-col">
          <span className="text-lg font-bold leading-tight">{APP_NAME}</span>
          <span className="text-xs text-neutral-400">{APP_TAGLINE}</span>
        </span>
      </Link>
      <div className="mt-3">
        <TopMenu />
      </div>
    </header>
  );
}
