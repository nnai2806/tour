import slugify from "slugify";

export const generateSlug = (text) => {
  const slug = slugify(text, {
    lower: true,
    remove: /[*+~.()'"!:@]/g,
    locale: "vi",
  });

  const randomPid = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");

  const finalSlug = `${slug}-${randomPid}`;

  return finalSlug;
};
