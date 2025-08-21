export function PropertiesPanel({ block, updateBlock }) {
    const config = blockConfig[block.type];
    return (
      <div>
        {Object.entries(config.props).map(([key, schema]) => (
          <div key={key}>
            <label>{key}</label>
            <input
              type={schema.type === "number" ? "number" : "text"}
              value={block.props[key]}
              onChange={(e) =>
                updateBlock(block.id, {
                  ...block.props,
                  [key]: schema.type === "number" ? +e.target.value : e.target.value,
                })
              }
            />
          </div>
        ))}
      </div>
    );
  }
  