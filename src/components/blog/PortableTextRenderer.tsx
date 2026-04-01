interface Block {
  _type: string;
  _key: string;
  style?: string;
  children?: Span[];
  listItem?: string;
  level?: number;
  marks?: { decorators?: { title: string; value: string }[]; annotations?: unknown[] };
  alt?: string;
  asset?: { _ref: string };
}

interface Span {
  _type: string;
  _key: string;
  text: string;
  marks?: string[];
}

interface PortableTextRendererProps {
  blocks: Block[];
}

const renderSpan = (span: Span) => {
  let content: React.ReactNode = span.text;
  if (span.marks?.includes("strong")) {
    content = <strong key={span._key}>{content}</strong>;
  }
  if (span.marks?.includes("em")) {
    content = <em key={span._key}>{content}</em>;
  }
  return <span key={span._key}>{content}</span>;
};

const PortableTextRenderer = ({ blocks }: PortableTextRendererProps) => {
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];
  let inList = false;

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="my-4 ml-6 list-disc space-y-2 text-muted-foreground">
          {currentList}
        </ul>
      );
      currentList = [];
      inList = false;
    }
  };

  blocks.forEach((block) => {
    if (block._type === "image") return;

    if (block.listItem === "bullet") {
      inList = true;
      currentList.push(
        <li key={block._key}>{block.children?.map(renderSpan)}</li>
      );
      return;
    }

    if (inList) flushList();

    const children = block.children?.map(renderSpan);

    switch (block.style) {
      case "h2":
        elements.push(
          <h2 key={block._key} className="mb-4 mt-8 font-display text-2xl font-bold text-foreground">
            {children}
          </h2>
        );
        break;
      case "h3":
        elements.push(
          <h3 key={block._key} className="mb-3 mt-6 font-display text-xl font-semibold text-foreground">
            {children}
          </h3>
        );
        break;
      case "h4":
        elements.push(
          <h4 key={block._key} className="mb-2 mt-4 font-display text-lg font-semibold text-foreground">
            {children}
          </h4>
        );
        break;
      case "blockquote":
        elements.push(
          <blockquote key={block._key} className="my-4 border-l-4 border-primary pl-4 italic text-muted-foreground">
            {children}
          </blockquote>
        );
        break;
      default:
        elements.push(
          <p key={block._key} className="mb-4 leading-relaxed text-muted-foreground">
            {children}
          </p>
        );
    }
  });

  if (inList) flushList();

  return <div className="prose-custom">{elements}</div>;
};

export default PortableTextRenderer;
