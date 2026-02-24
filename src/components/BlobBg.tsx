export default function BlobBg() {
  return (
    <div
      className="fixed bottom-0 right-0 pointer-events-none select-none"
      style={{ width: "45vw", maxWidth: 600, zIndex: 0 }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 500 480"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "auto" }}
      >
        <path
          d="M420,60 C480,100 520,200 490,310 C460,420 360,480 250,470 C140,460 40,400 20,300 C0,200 60,80 160,40 C260,0 360,20 420,60 Z"
          fill="#d4e8c2"
        />
      </svg>
    </div>
  );
}
