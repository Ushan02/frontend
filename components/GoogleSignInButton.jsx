import { useEffect, useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

export default function GoogleSignInButton({
  onSuccess,
  onError,
  text = "continue_with",
}) {
  const wrapRef = useRef(null);
  const [width, setWidth] = useState(280);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const update = () => {
      const measured = Math.floor(el.getBoundingClientRect().width);
      if (measured > 0) {
        setWidth(Math.max(200, Math.min(measured, 400)));
      }
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener("resize", update);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div ref={wrapRef} className="google-signin-wrap w-full">
      <GoogleLogin
        onSuccess={onSuccess}
        onError={onError}
        theme="outline"
        size="large"
        text={text}
        shape="rectangular"
        width={width}
      />
    </div>
  );
}
