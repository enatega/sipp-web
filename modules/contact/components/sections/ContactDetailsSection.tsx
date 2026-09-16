import { ContactForm } from "../ContactForm";
import { ContactInfoColumn } from "./ContactInfoColumn";

export function ContactDetailsSection() {
  return (
    <section className="py-14 sm:py-20">
      <div className="section-wrap grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ContactInfoColumn />
        <ContactForm />
      </div>
    </section>
  );
}
