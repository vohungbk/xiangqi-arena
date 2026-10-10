import Link from 'next/link';
import { HOME_HREF } from '@/lib/nav-items';
import { LanguageButton } from './LanguageButton';
import { TopMenu } from './TopMenu';
import { UserBlock } from './UserBlock';

const APP_NAME = 'Xiangqi Arena - Cờ Tướng Arena';
const APP_TAGLINE = 'Nền tảng Cờ Tướng Trực Tuyến';

export function AppHeader() {
  return (
    <header className="border-b border-line px-6 pt-4">
      <div className="flex items-center justify-between gap-4">
        <Link href={HOME_HREF} className="flex w-fit items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gold text-xl text-gold"
          >
            帥
          </span>
          <span className="flex flex-col">
            <span className="text-lg font-bold leading-tight">{APP_NAME}</span>
            <span className="text-xs text-fg-muted">{APP_TAGLINE}</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <LanguageButton />
          <UserBlock />
        </div>
      </div>
      <div className="mt-3">
        <TopMenu />
      </div>
    </header>
  );
}
