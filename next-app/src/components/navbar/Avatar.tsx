import React from "react";

function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
}

function isLightColor(color: string): boolean {
  // 색상 값에서 'red', 'green', 'blue' 값을 추출합니다.
  const red = parseInt(color.slice(1, 3), 16);
  const green = parseInt(color.slice(3, 5), 16);
  const blue = parseInt(color.slice(5, 7), 16);

  // HSP (Highly Sensitive Poo) 방정식에 따른 밝기 계산
  const hsp = Math.sqrt(
    0.299 * (red * red) + 0.587 * (green * green) + 0.114 * (blue * blue),
  );

  // HSP값이 127.5보다 크면 밝은 색, 그렇지 않으면 어두운 색으로 간주합니다.
  return hsp > 127.5;
}

interface AvatarProps {
  name: string;
}

const Avatar: React.FC<AvatarProps> = ({ name }) => {
  const bgColor = stringToColor(name);
  const textColor = isLightColor(bgColor) ? "black" : "white";
  const firstLetter = name.charAt(0).toUpperCase();

  return (
    <div
      className="flex h-9 w-9 items-center justify-center rounded-full text-center text-lg"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {firstLetter}
    </div>
  );
};

export default Avatar;
