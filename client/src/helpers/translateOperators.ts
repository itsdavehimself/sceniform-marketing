const OPERATOR_MAP: Record<string, string> = {
  // General / Basic
  exists: "Exists",
  notexists: "Does not exist",

  // Text
  "text:equal": "Text: Equal to",
  "text:notequal": "Text: Not equal to",
  "text:contains": "Text: Contains",
  "text:notcontains": "Text: Does not contain",
  "text:startsw": "Text: Starts with",
  "text:notstartsw": "Text: Does not start with",
  "text:endsw": "Text: Ends with",
  "text:notendsw": "Text: Does not end with",

  // Numeric
  "number:equal": "Numeric: Equal to",
  "number:notequal": "Numeric: Not equal to",
  "number:greater": "Numeric: Greater than",
  "number:greaterequal": "Numeric: Greater than or equal to",
  "number:less": "Numeric: Less than",
  "number:lessequal": "Numeric: Less than or equal to",

  // Date & Time
  "date:equal": "Date: Same as",
  "date:notequal": "Date: Not same as",
  "date:before": "Date: Before",
  "date:after": "Date: After",
  "time:equal": "Time: Same as",
  "time:notequal": "Time: Not same as",
  "time:before": "Time: Before",
  "time:after": "Time: After",

  // Boolean
  "boolean:istrue": "Boolean: Is true",
  "boolean:isfalse": "Boolean: Is false",

  // Array
  "array:length:equal": "Array length: Equal to",
  "array:length:greater": "Array length: Greater than",
  "array:length:less": "Array length: Less than",
  "array:contains": "Array: Contains",
  "array:notcontains": "Array: Does not contain",
};

export const translateOperator = (
  rawOperator: string | undefined | null,
): string => {
  if (!rawOperator) return "Unknown Operator";

  return OPERATOR_MAP[rawOperator] || rawOperator;
};
