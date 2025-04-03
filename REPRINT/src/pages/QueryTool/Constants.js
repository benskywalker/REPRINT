export const views = [
    { label: "Person", value: "person" },
    { label: "Organization", value: "organization" },
    { label: "Place", value: "place" },
    { label: "Religion", value: "religion" },
    { label: "Document", value: "document" },
  ];
  
  export const boolItems = [
    { label: "Equals", value: "equals" },
    { label: "Not Equals", value: "not_equals" },
    { label: "Like", value: "like" },
    { label: "Not Like", value: "not_like" },
    { label: "Greater Than", value: "greater_than" },
    { label: "Less Than", value: "less_than" },
    { label: "Greater Than or Equal", value: "greater_than_or_equal" },
    { label: "Less Than or Equal", value: "less_than_or_equal" },
  ];
  
  export const actionItems = [
    { label: "And", value: "and" },
    { label: "Or", value: "or" },
    { label: "Remove", value: "remove" },
  ];
  
  export const firstActionItems = [
    { label: "And", value: "and" },
    { label: "Or", value: "or" },
  ];
  
  export const relatedEntitiesMap = {
    person: ["document", "religion", "organization"],
    organization: ["person", "religion", "document"],
    religion: ["person", "organization"],
    document: ["person", "organization"],
  };