export const prettifyFieldName = (fieldName) => {
  if (!fieldName) return "";
  // Insert spaces between a lowercase letter and an uppercase letter and replace underscores with a space
  let withSpaces = fieldName
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ");
  
  // Remove any spaces between consecutive uppercase letters
  withSpaces = withSpaces.replace(/([A-Z])\s+([A-Z])/g, "$1$2");
  
  // Capitalize the first letter, and trim excess whitespace
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1).trim();
};