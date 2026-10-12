/**
 * The kind of a live game screen (ENG-F07 R14, R17). The shell needs it to pick the leave
 * modal: an AI or local game only asks to confirm, an online game is another story.
 * It is UI only, so it stays in the web app.
 */
export const LiveGameKind = {
  AI: 'AI',
  LOCAL: 'LOCAL',
  ONLINE: 'ONLINE',
} as const;

export type LiveGameKind = (typeof LiveGameKind)[keyof typeof LiveGameKind];
