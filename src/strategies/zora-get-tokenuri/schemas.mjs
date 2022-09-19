export const zoraTokenUriSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  properties: {
    body: {
      properties: {
        artist: {
          type: "string",
        },
        artwork: {
          properties: {
            info: {
              properties: {
                uri: {
                  format: "uri",
                  type: "string",
                },
              },
              required: ["uri"],
              type: "object",
            },
          },
          type: "object",
        },
        duration: {
          format: "float",
          type: "number",
        },
        notes: {
          type: "string",
          nullable: true,
        },
        title: {
          type: "string",
        },
      },
      required: ["artist", "title"],
      type: "object",
    },
    name: {
      type: "string",
    },
  },
  type: "object",
};
