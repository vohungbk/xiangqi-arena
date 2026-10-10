import { GameMode, RATING } from '@xiangqi/shared-types';
import type { HeaderRating } from './header-user';

export interface HeaderRatingLine {
  mode: GameMode;
  rating: number;
  /** Fewer than the official number of games: shown with the mark "Đang Đánh Giá". */
  provisional: boolean;
}

const MODE_NAMES: Record<GameMode, string> = {
  [GameMode.BLITZ]: 'Blitz',
  [GameMode.RAPID]: 'Rapid',
  [GameMode.CLASSIC]: 'Classic',
};

/**
 * The header shows the Rating of the mode with the most games.
 * Rapid is shown when modes are tied or no game was played (ENG-F07 R23).
 */
export function pickHeaderRating(ratings: readonly HeaderRating[]): HeaderRatingLine {
  const most = Math.max(0, ...ratings.map((r) => r.gamesPlayed));
  const leaders = ratings.filter((r) => r.gamesPlayed === most);
  const chosen =
    most > 0 && leaders.length === 1 ? leaders[0] : ratings.find((r) => r.mode === GameMode.RAPID);

  const mode = chosen?.mode ?? GameMode.RAPID;
  return {
    mode,
    rating: chosen?.rating ?? RATING.BASE,
    provisional: (chosen?.gamesPlayed ?? 0) < RATING.PROVISIONAL_GAMES,
  };
}

/** Text of the Rating line, for example "Rating Rapid: 1500". */
export function formatHeaderRating(line: HeaderRatingLine): string {
  return `Rating ${MODE_NAMES[line.mode]}: ${line.rating}`;
}
