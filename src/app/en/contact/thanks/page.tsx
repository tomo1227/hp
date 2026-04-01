import Link from "next/link";

export default function Page() {
  return (
    <div className="contact-wrapper">
      <div className="contact-contents contact-thanks">
        <p className="contact-kicker">Thank you</p>
        <h1 className="contact-thanks-title">Message received</h1>
        <p className="contact-subtitle">Thanks for reaching out.</p>
        <div className="contact-thanks-actions">
          <Link className="contact-link" href="/en/contact">
            Back to contact
          </Link>
          <Link className="contact-link" href="/en/gallery">
            Explore gallery
          </Link>
        </div>
      </div>
    </div>
  );
}
