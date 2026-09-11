interface Span {
  _type: string;
  _key: string;
  text: string;
  marks?: string[];
}

interface TableRow {
  _key?: string;
  cells?: string[];
}

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
  rows?: TableRow[];
}

interface PortableTextRendererProps {
  blocks: Block[];
}

const renderSpan = (span: Span) => {
  let content: React.ReactNode = span.text;
  if (span.marks?.includes("strong")) {
    content = <strong className="text-foreground">{content}</strong>;
  }
  if (span.marks?.includes("em")) {
    content = <em>{content}</em>;
  }
  return <span key={span._key}>{content}</span>;
};

const PortableTextRenderer = ({ blocks }: PortableTextRendererProps) => {
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];
  let listType: "bullet" | "number" | null = null;

  const flushList = () => {
    if (currentList.length > 0) {
      const ListTag = listType === "number" ? "ol" : "ul";
      elements.push(
        <ListTag
          key={`list-${elements.length}`}
          className={`my-4 ml-6 space-y-2 text-muted-foreground ${
            listType === "number" ? "list-decimal" : "list-disc"
          }`}
        >
          {currentList}
        </ListTag>
      );
    }
    currentList = [];
    listType = null;
  };

  blocks?.forEach((block) => {
    if (block._type === "image") return;

    if (block._type === "table" && block.rows?.length) {
      flushList();
      const [head, ...body] = block.rows;
      elements.push(
        <div key={block._key} className="my-6 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-white/[0.04]">
                {head.cells?.map((cell, i) => (
                  <th
                    key={i}
                    className="border-b border-white/10 px-4 py-3 text-left font-display text-xs font-semibold uppercase tracking-wide text-secondary"
                  >
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, r) => (
                <tr key={row._key ?? r} className="transition-colors hover:bg-white/[0.03]">
                  {row.cells?.map((cell, i) => (
                    <td
                      key={i}
                      className="border-b border-white/5 px-4 py-3 align-top text-muted-foreground last:text-foreground"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      return;
    }

    if (block.listItem === "bullet" || block.listItem === "number") {
      const type = block.listItem === "number" ? "number" : "bullet";
      if (listType && listType !== type) flushList();
      listType = type;
      currentList.push(<li key={block._key}>{block.children?.map(renderSpan)}</li>);
      return;
    }

    flushList();

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

  flushList();

  return <div className="prose-custom">{elements}</div>;
};

export default PortableTextRenderer;
