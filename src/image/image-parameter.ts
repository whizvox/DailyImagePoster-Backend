import Parameter from "../query/parameter.ts";
import ParseError from "../query/parse-error.ts";
import Image from "./image.ts";

const imageParameter = (options: { required?: boolean } = {}) => {
  return new Parameter(
    async (value) => {
      const image = await Image.findByPk(value);
      if (image === null) {
        throw new ParseError("No image found");
      }
      return image;
    },
    undefined,
    options.required,
  );
};

export default imageParameter;
