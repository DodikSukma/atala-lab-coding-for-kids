import CharacterSprite from "@/components/block-studio/CharacterSprite";
import {
  CHARACTER_META,
  type CharacterId,
  type CharacterVisualState,
} from "@/lib/characterState";

export default function CharacterGuide({
  character = "bot",
  state = "talk",
  badgeText,
  title,
  message,
  companion,
}: {
  character?: CharacterId;
  state?: CharacterVisualState;
  badgeText?: string;
  title: string;
  message: string;
  companion?: boolean;
}) {
  const meta = CHARACTER_META[character];
  return (
    <div className="character-guide-card" role="region" aria-label={`Pemandu misi ${meta.name}`}>
      <div className="character-guide-avatars">
        <div className="character-avatar-bubble primary-avatar">
          <CharacterSprite character={character} state={state} size={68} />
        </div>
        {companion && (
          <div className="character-avatar-bubble secondary-avatar">
            <CharacterSprite
              character={character === "bot" ? "cat" : "bot"}
              state="idle"
              size={52}
            />
          </div>
        )}
      </div>
      <div className="character-guide-body">
        <div className="character-guide-meta">
          <span className="character-guide-name">
            {meta.name} · {meta.role}
          </span>
          {badgeText && <span className="character-guide-pill">{badgeText}</span>}
        </div>
        <h2 className="character-guide-title">{title}</h2>
        <p className="character-guide-message">{message}</p>
      </div>
    </div>
  );
}
