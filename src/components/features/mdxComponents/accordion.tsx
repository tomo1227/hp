type AccordionProps = {
  title: string;
  children: React.ReactNode;
};

export const Accordion: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }: AccordionProps) => {
  return (
    <details className="accordion">
      <summary className="accordion-header">{title}</summary>
      <div className="accordion-content">{children}</div>
    </details>
  );
};
