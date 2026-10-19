import type { CharacterId, CharacterVisualState } from "@/lib/characterState";

export default function CharacterSprite({
  character,
  state = "idle",
  size = 64,
  ariaLabel,
  className = "",
}: {
  character: CharacterId;
  state?: CharacterVisualState;
  size?: number;
  ariaLabel?: string;
  className?: string;
}) {
  const isDecorative = !ariaLabel;

  if (character === "bot") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`atala-character character-kiko state-${state} ${className}`.trim()}
        role={isDecorative ? undefined : "img"}
        aria-label={ariaLabel}
        aria-hidden={isDecorative ? "true" : undefined}
      >
        <ellipse
          cx="50"
          cy="90"
          rx={state === "move" ? "26" : "22"}
          ry="6"
          fill={state === "success" ? "#facc15" : "#38bdf8"}
          opacity="0.35"
        />
        <line
          x1="50"
          y1="22"
          x2={state === "turn" ? "56" : "50"}
          y2="9"
          stroke="#60a5fa"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle
          cx={state === "turn" ? "56" : "50"}
          cy="8"
          r="6"
          fill={
            state === "error"
              ? "#f43f5e"
              : state === "success"
                ? "#facc15"
                : state === "talk"
                  ? "#38bdf8"
                  : "#facc15"
          }
        />
        <rect x="13" y="40" width="9" height="22" rx="4.5" fill="#1d4ed8" />
        <rect x="78" y="40" width="9" height="22" rx="4.5" fill="#1d4ed8" />
        <rect
          x="20"
          y="22"
          width="60"
          height="54"
          rx="18"
          fill="#2563eb"
          stroke="#93c5fd"
          strokeWidth="3"
        />
        <path
          d="M28 28H72C75 28 76 30 76 33V38H24V33C24 30 25 28 28 28Z"
          fill="#60a5fa"
          opacity="0.45"
        />
        <rect
          x="27"
          y="33"
          width="46"
          height="28"
          rx="10"
          fill="#0f172a"
          stroke="#38bdf8"
          strokeWidth="2"
        />
        {state === "success" && (
          <g fill="#facc15">
            <polygon points="39,41 41,45 45,45 42,48 43,52 39,49 35,52 36,48 33,45 37,45" />
            <polygon points="61,41 63,45 67,45 64,48 65,52 61,49 57,52 58,48 55,45 59,45" />
            <path
              d="M43 54Q50 60 57 54"
              stroke="#38bdf8"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )}
        {state === "error" && (
          <g stroke="#fb7185" strokeWidth="3" strokeLinecap="round">
            <line x1="35" y1="42" x2="43" y2="50" />
            <line x1="43" y1="42" x2="35" y2="50" />
            <circle cx="61" cy="46" r="4.5" fill="none" />
            <path d="M43 56Q50 51 57 56" fill="none" />
          </g>
        )}
        {state === "talk" && (
          <g>
            <circle cx="39" cy="45" r="4.5" fill="#38bdf8" />
            <circle cx="61" cy="45" r="4.5" fill="#38bdf8" />
            <rect x="42" y="52" width="16" height="6" rx="3" fill="#facc15" />
          </g>
        )}
        {state === "turn" && (
          <g>
            <circle cx="43" cy="45" r="4.5" fill="#38bdf8" />
            <circle cx="65" cy="45" r="4.5" fill="#38bdf8" />
            <circle cx="44.5" cy="44" r="1.5" fill="#ffffff" />
            <circle cx="66.5" cy="44" r="1.5" fill="#ffffff" />
            <path
              d="M45 54Q52 58 58 54"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )}
        {(state === "idle" || state === "move") && (
          <g>
            <circle cx="39" cy="45" r="4.8" fill="#38bdf8" />
            <circle cx="61" cy="45" r="4.8" fill="#38bdf8" />
            <circle cx="40.5" cy="43.5" r="1.6" fill="#ffffff" />
            <circle cx="62.5" cy="43.5" r="1.6" fill="#ffffff" />
            <path
              d="M43 53Q50 58 57 53"
              stroke="#38bdf8"
              strokeWidth="2.8"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )}
        <rect x="37" y="65" width="26" height="7" rx="3.5" fill="#1e3a8a" />
        <circle cx="44" cy="68.5" r="2" fill="#facc15" />
        <circle cx="50" cy="68.5" r="2" fill="#38bdf8" />
        <circle cx="56" cy="68.5" r="2" fill="#4ade80" />
        <rect
          x={state === "move" ? "26" : "29"}
          y={state === "move" ? "75" : "76"}
          width="15"
          height="10"
          rx="5"
          fill="#1e3a8a"
        />
        <rect
          x={state === "move" ? "59" : "56"}
          y={state === "move" ? "77" : "76"}
          width="15"
          height="10"
          rx="5"
          fill="#1e3a8a"
        />
        <polygon points="94,50 85,44 85,56" fill="#facc15" />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`atala-character character-kiki state-${state} ${className}`.trim()}
      role={isDecorative ? undefined : "img"}
      aria-label={ariaLabel}
      aria-hidden={isDecorative ? "true" : undefined}
    >
      <ellipse
        cx="50"
        cy="90"
        rx={state === "move" ? "26" : "22"}
        ry="6"
        fill={state === "success" ? "#facc15" : "#fb923c"}
        opacity="0.35"
      />
      <path
        d={
          state === "move" || state === "success"
            ? "M22 68C10 62 9 44 18 39"
            : "M22 70C12 66 12 50 20 45"
        }
        stroke="#ea580c"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      <polygon
        points="24,36 22,12 42,24"
        fill="#f97316"
        stroke="#fed7aa"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <polygon points="27,32 26,17 38,25" fill="#fda4af" />
      <polygon
        points="76,36 78,12 58,24"
        fill="#f97316"
        stroke="#fed7aa"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <polygon points="73,32 74,17 62,25" fill="#fda4af" />
      <rect
        x="21"
        y="24"
        width="58"
        height="52"
        rx="24"
        fill="#f97316"
        stroke="#ffedd5"
        strokeWidth="3"
      />
      <path
        d="M45 26V33M50 25V34M55 26V33"
        stroke="#c2410c"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <ellipse cx="50" cy="54" rx="22" ry="15" fill="#fff7ed" />
      <g stroke="#9a3412" strokeWidth="2" strokeLinecap="round">
        <line x1="15" y1="48" x2="27" y2="50" />
        <line x1="15" y1="55" x2="27" y2="54" />
        <line x1="85" y1="48" x2="73" y2="50" />
        <line x1="85" y1="55" x2="73" y2="54" />
      </g>
      {state === "success" && (
        <g>
          <polygon
            points="38,40 40,44 44,44 41,47 42,51 38,48 34,51 35,47 32,44 36,44"
            fill="#eab308"
          />
          <polygon
            points="62,40 64,44 68,44 65,47 66,51 62,48 58,51 59,47 56,44 60,44"
            fill="#eab308"
          />
          <path
            d="M44 56Q50 63 56 56"
            stroke="#9a3412"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      )}
      {state === "error" && (
        <g stroke="#be123c" strokeWidth="2.8" strokeLinecap="round">
          <path d="M34 43L42 49M42 43L34 49" />
          <path d="M58 43L66 49M66 43L58 49" />
          <path d="M45 58Q50 53 55 58" fill="none" />
        </g>
      )}
      {state === "talk" && (
        <g>
          <circle cx="38" cy="45" r="4.8" fill="#1e293b" />
          <circle cx="62" cy="45" r="4.8" fill="#1e293b" />
          <circle cx="39.5" cy="43.5" r="1.6" fill="#ffffff" />
          <circle cx="63.5" cy="43.5" r="1.6" fill="#ffffff" />
          <ellipse cx="50" cy="57" rx="5.5" ry="4.5" fill="#fb7185" stroke="#9a3412" strokeWidth="2" />
        </g>
      )}
      {state === "turn" && (
        <g>
          <circle cx="42" cy="45" r="4.8" fill="#1e293b" />
          <circle cx="65" cy="45" r="4.8" fill="#1e293b" />
          <circle cx="43.5" cy="43.5" r="1.6" fill="#ffffff" />
          <circle cx="66.5" cy="43.5" r="1.6" fill="#ffffff" />
          <path
            d="M46 56Q50 60 55 56"
            stroke="#9a3412"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      )}
      {(state === "idle" || state === "move") && (
        <g>
          <circle cx="38" cy="45" r="4.8" fill="#1e293b" />
          <circle cx="62" cy="45" r="4.8" fill="#1e293b" />
          <circle cx="39.5" cy="43.5" r="1.6" fill="#ffffff" />
          <circle cx="63.5" cy="43.5" r="1.6" fill="#ffffff" />
          <path
            d="M44 55Q47 59 50 55Q53 59 56 55"
            stroke="#9a3412"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      )}
      <polygon points="50,52 46,48 54,48" fill="#f43f5e" />
      <rect x="31" y="68" width="38" height="6" rx="3" fill="#2563eb" />
      <circle cx="50" cy="73" r="5" fill="#facc15" stroke="#1e3a8a" strokeWidth="1.5" />
      <ellipse
        cx={state === "move" ? "35" : "37"}
        cy={state === "move" ? "79" : "80"}
        rx="7"
        ry="5"
        fill="#fff7ed"
        stroke="#ea580c"
        strokeWidth="2"
      />
      <ellipse
        cx={state === "move" ? "65" : "63"}
        cy={state === "move" ? "81" : "80"}
        rx="7"
        ry="5"
        fill="#fff7ed"
        stroke="#ea580c"
        strokeWidth="2"
      />
      <polygon points="94,50 85,44 85,56" fill="#facc15" />
    </svg>
  );
}
