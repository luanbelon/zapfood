import { ImageResponse } from "next/og";
import { getPrimaryColor } from "@/lib/env";

export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon() {
  const bg = getPrimaryColor();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: bg,
          fontSize: 96,
        }}
      >
        🍔
      </div>
    ),
    { ...size },
  );
}
