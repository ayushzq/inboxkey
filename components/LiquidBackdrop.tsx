export default function LiquidBackdrop() {
  return (
    <div className="liquid-field" aria-hidden="true">
      <div
        className="liquid-blob animate-blob"
        style={{
          top: "-10%",
          left: "-5%",
          width: "42vw",
          height: "42vw",
          background:
            "radial-gradient(circle, rgba(139,92,246,0.55), transparent 70%)"
        }}
      />
      <div
        className="liquid-blob animate-blob-delay"
        style={{
          top: "10%",
          right: "-10%",
          width: "38vw",
          height: "38vw",
          background:
            "radial-gradient(circle, rgba(34,211,238,0.45), transparent 70%)"
        }}
      />
      <div
        className="liquid-blob animate-blob"
        style={{
          bottom: "-15%",
          left: "20%",
          width: "45vw",
          height: "45vw",
          background:
            "radial-gradient(circle, rgba(244,114,182,0.4), transparent 70%)"
        }}
      />
      <div className="grain" />
    </div>
  );
}
