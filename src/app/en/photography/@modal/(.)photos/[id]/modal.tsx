"use client";

import { useRouter } from "next/navigation";
import { type ElementRef, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export function Modal({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const dialogRef = useRef<ElementRef<"dialog">>(null);

    useEffect(() => {
        if (!dialogRef.current?.open) {
            dialogRef.current?.showModal();
        }
    }, []);

    function onDismiss() {
        router.back();
    }

    return createPortal(
        <div className="modal-backdrop">
            <dialog ref={dialogRef} className="modal" onClose={onDismiss}>
                <button
                    type="button"
                    onClick={onDismiss}
                    className="close-button"
                />
                {children}
            </dialog>
        </div>,
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        document.getElementById("modal-root")!,
    );
}
