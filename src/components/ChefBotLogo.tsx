import type { SVGProps } from "react";

function ChefBotLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 220"
      width="200"
      height="220"
      {...props}
    >
      <rect x="70" y="30" width="60" height="10" rx="3" fill="#1a1a1a" />
      <ellipse cx="100" cy="28" rx="30" ry="18" fill="#2d2d2d" />
      <ellipse cx="82" cy="22" rx="14" ry="18" fill="#3a3a3a" />
      <ellipse cx="118" cy="22" rx="14" ry="18" fill="#3a3a3a" />
      <ellipse cx="100" cy="18" rx="18" ry="20" fill="#4a4a4a" />
      <rect x="60" y="70" width="80" height="70" rx="12" fill="#2d2d2d" />
      <circle cx="82" cy="95" r="10" fill="#f0f0f0" />
      <circle cx="118" cy="95" r="10" fill="#f0f0f0" />
      <circle cx="82" cy="95" r="6" fill="#1a1a1a" />
      <circle cx="118" cy="95" r="6" fill="#1a1a1a" />
      <circle cx="84" cy="93" r="2" fill="#ffffff" />
      <circle cx="120" cy="93" r="2" fill="#ffffff" />
      <rect x="80" y="116" width="8" height="8" rx="1" fill="#888888" />
      <rect x="90" y="116" width="8" height="8" rx="1" fill="#bbbbbb" />
      <rect x="100" y="116" width="8" height="8" rx="1" fill="#888888" />
      <rect x="110" y="116" width="8" height="8" rx="1" fill="#bbbbbb" />
      <rect x="98" y="55" width="4" height="15" rx="2" fill="#1a1a1a" />
      <circle cx="100" cy="53" r="4" fill="#888888" />
      <rect x="90" y="140" width="20" height="10" rx="3" fill="#3a3a3a" />
      <rect x="72" y="150" width="56" height="30" rx="8" fill="#3a3a3a" />
      <rect x="82" y="158" width="12" height="12" rx="3" fill="#888888" />
      <rect x="106" y="158" width="12" height="12" rx="3" fill="#888888" />
      <text
        x="100"
        y="205"
        fontFamily="Arial, sans-serif"
        fontSize="22"
        fontWeight="700"
        textAnchor="middle"
        fill="#1a1a1a"
        letterSpacing="2"
      >
        ChefBot
      </text>
    </svg>
  );
}

export default ChefBotLogo;
