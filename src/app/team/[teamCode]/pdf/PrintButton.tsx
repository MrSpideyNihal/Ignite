"use client";

export default function PrintButton() {
    return (
        <button
            onClick={() => window.print()}
            className="print-hide"
            style={{
                display: "block",
                margin: "16px auto",
                padding: "10px 28px",
                background: "#6366f1",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "15px",
                cursor: "pointer",
            }}
        >
            🖨️ Print / Save PDF
        </button>
    );
}
