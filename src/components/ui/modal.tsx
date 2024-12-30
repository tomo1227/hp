"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof document !== "undefined") {
      setModalRoot(document.getElementById("modal-root"));
    }
  }, []);

  useEffect(() => {
    if (dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
    }
  }, []);

  function onDismiss() {
    router.back();
  }

  // サーバーサイドでは何もレンダリングしない
  if (!modalRoot) return null;

  return createPortal(
    <div className="modal-backdrop">
      <dialog ref={dialogRef} className="modal" onClose={onDismiss}>
        <button type="button" onClick={onDismiss} className="close-button" />
        {children}
      </dialog>
    </div>,
    modalRoot
  );
}
