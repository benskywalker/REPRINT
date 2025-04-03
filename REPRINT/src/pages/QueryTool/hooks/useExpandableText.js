import { useState } from 'react';

export const useExpandableText = () => {
  const [expandedRows, setExpandedRows] = useState({});

  const toggleExpand = (rowId, field) => {
    setExpandedRows((prev) => ({
      ...prev,
      [`${rowId}-${field}`]: !prev[`${rowId}-${field}`],
    }));
  };

  const truncateText = (text, rowId, field) => {
    if (!text) return "";
    if (text.length > 200) {
      const isExpanded = expandedRows[`${rowId}-${field}`];
      return (
        <>
          {isExpanded ? text : `${text.substring(0, 100)}...`}
          <span
            className="show-more"
            onClick={() => toggleExpand(rowId, field)}
          >
            {isExpanded ? "Show Less" : "Show More"}
          </span>
        </>
      );
    }
    return text;
  };

  return { expandedRows, toggleExpand, truncateText };
};